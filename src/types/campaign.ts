export interface SpotlightCard {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  active: boolean;
  order: number;
}

export interface SpotlightHeading {
  title?: string;
  subtitle?: string;
}
