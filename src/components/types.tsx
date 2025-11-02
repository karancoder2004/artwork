export interface Artwork   {
  
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions?: string | null;
  date_start: number;
  date_end: number;
  selected?:boolean
 
}

export interface ApiResponse   {

    data: Artwork[];
    pagination: {
    total: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };

}