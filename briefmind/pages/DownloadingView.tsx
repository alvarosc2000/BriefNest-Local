'use client'

import { motion } from "framer-motion";
import { Download } from "lucide-react";

export default function DownloadingView() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10">
      
      {/* Ícono con efecto pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-6"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <Download className="w-14 h-14 text-blue-400" />
      </motion.div>

      {/* Texto principal */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-2xl font-bold text-gray-100"
      >
        Preparando tu descarga
      </motion.h2>

      {/* Subtítulo */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-gray-400 text-sm mt-2"
      >
        Tu archivo se descargará automáticamente en unos segundos.
      </motion.p>

      {/* Barra animada */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-6"
      />

      {/* Texto auxiliar */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
        className="text-gray-500 text-xs mt-4 italic"
      >
        Si la descarga no comienza, revisa tu navegador.
      </motion.p>
    </div>
  );
}
