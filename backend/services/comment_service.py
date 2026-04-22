from uuid import UUID

from lib.exceptions import ForbiddenError, NotFoundError
from lib.supabase_client import supabase
from schemas.comment_schema import CommentCreate, CommentResponse


def _enrich_comment(comment: dict, requesting_user_id: UUID | None = None) -> dict:
    comment.setdefault('like_count', 0)

    author_row = (
        supabase.table('users')
        .select('username,display_name')
        .eq('id', str(comment['author_id']))
        .single()
        .execute()
    )
    author = author_row.data or {}
    comment['author_name'] = author.get('display_name') or author.get('username') or 'Unknown'
    comment['author_username'] = f"@{author.get('username')}" if author.get('username') else '@unknown'

    if requesting_user_id is not None:
        like_check = (
            supabase.table('comment_likes')
            .select('user_id')
            .eq('comment_id', str(comment['id']))
            .eq('user_id', str(requesting_user_id))
            .execute()
        )
        comment['is_liked'] = len(like_check.data) > 0

    return comment


async def _get_post(post_id: UUID) -> dict:
    row = (
        supabase.table('posts')
        .select('id,comments_enabled')
        .eq('id', str(post_id))
        .execute()
    )
    if not row.data:
        raise NotFoundError('Post not found')
    return row.data[0]


async def get_comments(post_id: UUID, requesting_user_id: UUID) -> list[CommentResponse]:
    await _get_post(post_id)
    row = (
        supabase.table('comments')
        .select('*')
        .eq('post_id', str(post_id))
        .order('created_at', desc=False)
        .execute()
    )
    return [CommentResponse(**_enrich_comment(comment, requesting_user_id)) for comment in row.data or []]


async def create_comment(post_id: UUID, user_id: UUID, data: CommentCreate) -> CommentResponse:
    post = await _get_post(post_id)
    if not post.get('comments_enabled', True):
        raise ForbiddenError('Comments are disabled for this post')

    row = (
        supabase.table('comments')
        .insert({
            'post_id': str(post_id),
            'author_id': str(user_id),
            'content': data.content,
        })
        .execute()
    )

    supabase.rpc('increment_field', {
        'table_name': 'posts',
        'field_name': 'comment_count',
        'row_id': str(post_id),
    }).execute()

    return CommentResponse(**_enrich_comment(row.data[0], user_id))


async def delete_comment(post_id: UUID, comment_id: UUID, user_id: UUID) -> None:
    row = (
        supabase.table('comments')
        .select('author_id')
        .eq('id', str(comment_id))
        .eq('post_id', str(post_id))
        .execute()
    )
    if not row.data:
        raise NotFoundError('Comment not found')
    if row.data[0]['author_id'] != str(user_id):
        raise ForbiddenError('You can only delete your own comments')

    supabase.table('comments').delete().eq('id', str(comment_id)).eq('post_id', str(post_id)).execute()
    supabase.rpc('decrement_field', {
        'table_name': 'posts',
        'field_name': 'comment_count',
        'row_id': str(post_id),
    }).execute()


async def like_comment(post_id: UUID, comment_id: UUID, user_id: UUID) -> None:
    await _ensure_comment_exists(post_id, comment_id)
    try:
        supabase.table('comment_likes').insert({
            'user_id': str(user_id),
            'comment_id': str(comment_id),
        }).execute()
    except Exception as exc:
        if '23505' in str(exc):
            return
        raise exc

    supabase.rpc('increment_field', {
        'table_name': 'comments',
        'field_name': 'like_count',
        'row_id': str(comment_id),
    }).execute()


async def unlike_comment(post_id: UUID, comment_id: UUID, user_id: UUID) -> None:
    await _ensure_comment_exists(post_id, comment_id)
    supabase.table('comment_likes').delete().eq('user_id', str(user_id)).eq('comment_id', str(comment_id)).execute()
    supabase.rpc('decrement_field', {
        'table_name': 'comments',
        'field_name': 'like_count',
        'row_id': str(comment_id),
    }).execute()


async def _ensure_comment_exists(post_id: UUID, comment_id: UUID) -> None:
    row = (
        supabase.table('comments')
        .select('id')
        .eq('id', str(comment_id))
        .eq('post_id', str(post_id))
        .execute()
    )
    if not row.data:
        raise NotFoundError('Comment not found')
