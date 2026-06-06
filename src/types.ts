export interface Channel {
  id: string;
  name: string;
  category: 'Entertainment & Music' | 'Sports & Games';
  logo: string;
  streamUrl: string;
}

export type CategoryFilter = 'All' | 'Entertainment & Music' | 'Sports & Games';
