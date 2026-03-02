import { io } from "socket.io-client";
import { API_ORIGIN } from "@/config/apiUrl";

export const socket = io(API_ORIGIN, {
  transports: ["websocket"],
  autoConnect: true,
});
