"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/components/listings/RecentlyViewed";

type Props = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
};

export function TrackRecentlyViewed({ id, title, price, currency, image }: Props) {
  useEffect(() => {
    trackRecentlyViewed({ id, title, price, currency, image });
  }, [id, title, price, currency, image]);

  return null;
}
