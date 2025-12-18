// DEPRECATED: Functions have been moved to @/lib/api
// This file is kept for backward compatibility

import { 
  createContactMessage as apiCreateMessage,
  getContactMessages as apiGetMessages,
  markMessageAsRead as apiMarkRead,
  deleteContactMessage as apiDeleteMessage,
} from "@/lib/api";

export const saveContactMessage = apiCreateMessage;
export const getContactMessages = apiGetMessages;
export const markMessageAsRead = apiMarkRead;
export const deleteContactMessage = apiDeleteMessage;
export const markMessageAsReplied = apiMarkRead; // Alias for compatibility
