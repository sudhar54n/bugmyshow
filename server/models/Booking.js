import { getSupabase } from '../config/database.js';

class Booking {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.movie_id = data.movie_id;
    this.movie_title = data.movie_title;
    this.seats = data.seats;
    this.seat_numbers = data.seat_numbers || [];
    this.total_price = data.total_price;
    this.show_time = data.show_time;
    this.booking_date = data.booking_date || new Date();
    this.payment_status = data.payment_status || 'confirmed';
  }

  static async find(query = {}) {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Database not available - returning empty array');
        return [];
      }
      
      let supabaseQuery = supabase.from('bookings').select('*');
      
      if (Object.keys(query).length > 0) {
        Object.keys(query).forEach(key => {
          if (query[key] !== undefined && query[key] !== null && query[key] !== 'undefined') {
            supabaseQuery = supabaseQuery.eq(key, query[key]);
          }
        });
      }
      
      const { data, error } = await supabaseQuery.order('booking_date', { ascending: false });
      
      if (error) throw error;
      
      return data ? data.map(booking => new Booking(booking)) : [];
    } catch (error) {
      console.error('Error in Booking.find:', error);
      return [];
    }
  }

  static async findById(id) {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.log('Database not available');
        return null;
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data ? new Booking(data) : null;
    } catch (error) {
      console.error('Error in Booking.findById:', error);
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
      
      const bookingData = {
        user_id: this.user_id,
        movie_id: this.movie_id,
        movie_title: this.movie_title,
        seats: this.seats,
        seat_numbers: this.seat_numbers,
        total_price: this.total_price,
        show_time: this.show_time,
        payment_status: this.payment_status
      };

      if (this.id) {
        // Update existing booking
        const { data, error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', this.id)
          .select()
          .single();
        
        if (error) throw error;
        return new Booking(data);
      } else {
        // Create new booking
        const { data, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();
        
        if (error) throw error;
        return new Booking(data);
      }
    } catch (error) {
      console.error('Error in Booking.save:', error);
      throw error;
    }
  }

  populate(field, select) {
    // This method would need to be implemented with joins in Supabase
    // For now, return the booking as-is
    return this;
  }
}

export default Booking;