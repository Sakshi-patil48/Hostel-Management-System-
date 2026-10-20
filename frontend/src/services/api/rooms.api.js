import { apiRequest, buildQueryString } from './client';

/**
 * Hostel Blocks, Rooms, and Beds API Service
 */
export const roomsApi = {
  /**
   * Get list of all hostel blocks/floors
   */
  async getBlocks() {
    return apiRequest('blocks/');
  },

  /**
   * Get rooms with optional search, block, floor, and type filters
   * @param {{ search?: string, block?: string|number, floor?: string|number, room_type?: string }} params
   */
  async getRooms(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`rooms/${qs}`);
  },

  /**
   * Get single room by ID
   * @param {number|string} id
   */
  async getRoom(id) {
    return apiRequest(`rooms/${id}/`);
  },

  /**
   * Create a new room
   * @param {Record<string, any>} data
   */
  async createRoom(data) {
    return apiRequest('rooms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing room
   * @param {number|string} id
   * @param {Record<string, any>} data
   */
  async updateRoom(id, data) {
    return apiRequest(`rooms/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete room by ID
   * @param {number|string} id
   */
  async deleteRoom(id) {
    return apiRequest(`rooms/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get beds list with optional room filter
   * @param {{ room?: number|string, is_occupied?: boolean }} params
   */
  async getBeds(params = {}) {
    const qs = buildQueryString(params);
    return apiRequest(`beds/${qs}`);
  },
};

export default roomsApi;
