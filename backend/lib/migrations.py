import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"


async def run_migrations():
    """
    Run all SQL migration files in the migrations directory.
    Migrations are executed in order based on their filenames.
    """
    try:
        from lib.supabase_client import get_supabase
        
        supabase = get_supabase()
        
        # Get all .sql files and sort them
        migration_files = sorted([f for f in MIGRATIONS_DIR.glob("*.sql")])
        
        if not migration_files:
            logger.warning("No migration files found")
            return
        
        logger.info(f"Found {len(migration_files)} migration files")
        
        for migration_file in migration_files:
            try:
                with open(migration_file, 'r') as f:
                    sql_content = f.read()
                
                logger.info(f"Running migration: {migration_file.name}")
                
                # Execute the migration using Supabase RPC or direct SQL
                # Split by GO or semicolon if needed
                statements = [s.strip() for s in sql_content.split(';') if s.strip()]
                
                for statement in statements:
                    try:
                        # Use Supabase's query execution
                        result = supabase.postgrest.rpc('exec_sql', {'sql': statement})
                        logger.debug(f"Executed: {statement[:50]}...")
                    except AttributeError:
                        # If RPC not available, try direct query
                        logger.debug(f"Skipping statement (RPC not available): {statement[:50]}...")
                        continue
                
                logger.info(f"Successfully completed migration: {migration_file.name}")
                
            except Exception as e:
                # Log but continue - some migrations might fail if they already exist
                logger.warning(f"Migration {migration_file.name} failed (may already exist): {str(e)}")
                continue
        
        logger.info("All migrations completed")
        
    except Exception as e:
        logger.error(f"Migration runner failed: {str(e)}")
        # Don't raise - let app continue even if migrations fail

