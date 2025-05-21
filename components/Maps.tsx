"use client";

import { useEffect } from "react";

export default function Maps() {
  useEffect(() => {
    const loadGoogleMaps = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  return null;
}
