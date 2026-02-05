#!/usr/bin/env python3
"""
Fix DATABASE_URL in .env file to use your macOS username
"""

import os
import re
from pathlib import Path

def fix_database_url():
    """Update DATABASE_URL in .env to use current username"""
    
    # Get current username
    username = os.getenv('USER') or os.getenv('USERNAME') or 'kadingroen'
    
    # Path to .env file
    env_file = Path(__file__).parent / '.env'
    
    if not env_file.exists():
        print(f"❌ .env file not found at: {env_file}")
        print("   Creating new .env file...")
        env_file.touch()
    
    # Read current .env file
    try:
        with open(env_file, 'r') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return False
    
    # New DATABASE_URL
    new_db_url = f"postgresql://{username}@localhost:5432/endurance_training"
    
    # Pattern to match DATABASE_URL line
    pattern = r'^DATABASE_URL=.*$'
    
    # Check if DATABASE_URL exists
    if re.search(pattern, content, re.MULTILINE):
        # Replace existing DATABASE_URL
        new_content = re.sub(
            pattern,
            f'DATABASE_URL={new_db_url}',
            content,
            flags=re.MULTILINE
        )
        action = "updated"
    else:
        # Add DATABASE_URL if it doesn't exist
        if content and not content.endswith('\n'):
            content += '\n'
        new_content = content + f'DATABASE_URL={new_db_url}\n'
        action = "added"
    
    # Write back to file
    try:
        with open(env_file, 'w') as f:
            f.write(new_content)
        
        print(f"✅ DATABASE_URL {action} successfully!")
        print(f"   Username: {username}")
        print(f"   URL: {new_db_url}")
        print()
        print("You can now run: python3 init_db.py")
        return True
    except Exception as e:
        print(f"❌ Error writing .env file: {e}")
        return False

if __name__ == "__main__":
    print("Fixing DATABASE_URL in .env file...")
    print()
    fix_database_url()
