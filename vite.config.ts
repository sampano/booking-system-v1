<<<<<<< HEAD
/*import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
=======
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
>>>>>>> 3cd18e97ed7c499da9d05dbff9c7681b2229f807

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/booking-system-v1/", // 👈 repo name for project site
});
=======
  base: '/booking-system-v1/', // 👈 repo name for project site
})
>>>>>>> 3cd18e97ed7c499da9d05dbff9c7681b2229f807
