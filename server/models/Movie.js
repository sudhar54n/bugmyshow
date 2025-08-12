import { supabase } from '../config/database.js';

class Movie {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.genre = data.genre;
    this.duration = data.duration;
    this.rating = data.rating;
    this.poster = data.poster;
    this.price = data.price;
    this.available_seats = data.available_seats || data.availableSeats;
    this.reviews = this.parseReviews(data.reviews);
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at;
  }

  parseReviews(reviews) {
    if (!reviews) return [];
    if (Array.isArray(reviews)) return reviews;
    if (typeof reviews === 'string') {
      try {
        return JSON.parse(reviews);
      } catch (error) {
        console.error('Error parsing reviews JSON:', error);
        return [];
      }
    }
    return [];
  }

  static async find(query = {}) {
    try {
      if (!supabase) {
        console.log('Database not available - returning empty array');
        return [];
      }
      
      let supabaseQuery = supabase.from('movies').select('*');
      
      if (Object.keys(query).length > 0) {
        Object.keys(query).forEach(key => {
          if (query[key] !== undefined) {
            if (key === 'title' && query[key].$regex) {
              // Handle regex search
              supabaseQuery = supabaseQuery.ilike('title', `%${query[key].$regex}%`);
            } else {
              supabaseQuery = supabaseQuery.eq(key, query[key]);
            }
          }
        });
      }
      
      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data ? data.map(movie => new Movie(movie)) : [];
    } catch (error) {
      console.error('Error in Movie.find:', error);
      return [];
    }
  }

  static async findById(id) {
    try {
      if (!supabase) {
        console.log('Database not available');
        return null;
      }
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data ? new Movie(data) : null;
    } catch (error) {
      console.error('Error in Movie.findById:', error);
      return null;
    }
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    try {
      if (!supabase) {
        console.log('Database not available');
        return null;
      }
      
      const { data, error } = await supabase
        .from('movies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data ? new Movie(data) : null;
    } catch (error) {
      console.error('Error in Movie.findByIdAndUpdate:', error);
      return null;
    }
  }

  static async findByIdAndDelete(id) {
    try {
      if (!supabase) {
        console.log('Database not available');
        return null;
      }
      
      const { data, error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data ? new Movie(data) : null;
    } catch (error) {
      console.error('Error in Movie.findByIdAndDelete:', error);
      return null;
    }
  }

  async save() {
    try {
      if (!supabase) {
        console.log('Database not available');
        throw new Error('Database not available');
      }
      
      const movieData = {
        title: this.title,
        description: this.description,
        genre: this.genre,
        duration: this.duration,
        rating: this.rating,
        poster: this.poster,
        price: this.price,
        available_seats: this.available_seats,
        reviews: JSON.stringify(this.reviews)
      };

      if (this.id) {
        // Update existing movie
        const { data, error } = await supabase
          .from('movies')
          .update(movieData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        return new Movie(data);
      } else {
        // Create new movie
        const { data, error } = await supabase
          .from('movies')
          .insert(movieData)
          .select()
          .single();
        
        if (error) throw error;
        return new Movie(data);
      }
    } catch (error) {
      console.error('Error in Movie.save:', error);
      throw error;
    }
  }
}

export default Movie;