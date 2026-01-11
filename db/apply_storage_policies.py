#!/usr/bin/env python3
"""
Apply Supabase Storage Policies to fix RLS errors
Run this script to set up storage bucket permissions
"""

import psycopg2
from psycopg2 import sql

# Database connection
DATABASE_URL = "postgresql://postgres.ckvypawtqdcoxbcyqwqp:pixova_intern@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

def apply_storage_policies():
    """Apply storage policies from storage_policies.sql"""
    
    print("🔗 Connecting to Supabase database...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("✅ Connected successfully!")
        print("📝 Reading storage_policies.sql...")
        
        # Read SQL file
        with open('storage_policies.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("🚀 Applying storage policies...")
        
        # Execute SQL
        cur.execute(sql_content)
        conn.commit()
        
        print("✅ Storage policies applied successfully!")
        
        # Verify policies
        print("\n📋 Verifying policies...")
        cur.execute("""
            SELECT schemaname, tablename, policyname, permissive, roles, cmd
            FROM pg_policies 
            WHERE tablename = 'objects'
            ORDER BY policyname;
        """)
        
        policies = cur.fetchall()
        
        if policies:
            print(f"\n✅ Found {len(policies)} policies:")
            for policy in policies:
                print(f"   - {policy[2]} ({policy[5]}) for roles: {policy[4]}")
        else:
            print("⚠️  No policies found!")
        
        cur.close()
        conn.close()
        
        print("\n🎉 Done! Storage should now work properly.")
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except FileNotFoundError:
        print("❌ storage_policies.sql file not found!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 Supabase Storage Policy Setup")
    print("=" * 60)
    apply_storage_policies()
