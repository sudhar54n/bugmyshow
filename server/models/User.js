import { getSupabase } from '../config/database.js';

class User {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.profile_picture = data.profile_picture || null;
    this.is_admin = data.is_admin || false;
    this.created_at = data.created_at || new Date();
  }

  static async findOne(query) {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Database not available - using fallback');
        return null;
      }
      
      let supabaseQuery = supabase.from('users').select('*');
      
      if (typeof query === 'string') {
        if (query !== undefined) {
          supabaseQuery = supabaseQuery.eq('id', query);
        }
      } else if (query.$or) {
        // Handle $or queries for username/email lookup
        const username = query.$or[0]?.username;
        const email = query.$or[1]?.email;
        
        if (username !== undefined && email !== undefined) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`);
          
          if (error) throw error;
          return data && data.length > 0 ? new User(data[0]) : null;
        }
      } else {
        // Handle regular queries
        Object.keys(query).forEach(key => {
          if (query[key] !== undefined) {
            supabaseQuery = supabaseQuery.eq(key, query[key]);
          }
        });
      }
      
      const { data, error } = await supabaseQuery.single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      
      return data ? new User(data) : null;
    } catch (error) {
      console.error('Error in User.findOne:', error);
      return null;
    }
  }

  static async findById(id) {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Database not available');
        return null;
      }
      
      if (id === undefined) {
        console.log('ID is undefined');
        return null;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data ? new User(data) : null;
    } catch (error) {
      console.error('Error in User.findById:', error);
      return null;
    }
  }

  async save() {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Database not available');
        throw new Error('Database not available');
      }
      
      const userData = {
        username: this.username,
        email: this.email,
        password: this.password,
        user_id: this.user_id,
        profile_picture: this.profile_picture,
        is_admin: this.is_admin
      };

      if (this.id) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        return new User(data);
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();
        
        if (error) throw error;
        return new User(data);
      }
    } catch (error) {
      console.error('Error in User.save:', error);
      throw error;
    }
  }

  select(fields) {
    const result = { ...this };
    if (fields === '-password') {
      delete result.password;
    }
    return result;
  }
}

export default User;