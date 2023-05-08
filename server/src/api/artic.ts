import axios from "axios";
import { ArtworkParameters, Artworks } from "@ts/artic";

const url = "https://api.artic.edu/api/v1/artworks";

export async function listArtworks(pageNumber: number, pageSize: number) {
  const params: ArtworkParameters = {
    page: pageNumber,
    limit: pageSize
  };
  
  try {
    const axiosResponse = await axios.get(url, {
      params
    });

    /* return pagination info alongside with real data in case users want to write a script that loops through all the pages */
    const artworks: Artworks = {
      pagination: axiosResponse.data.pagination,
      data: axiosResponse.data.data.map((x: any) => ({
        id: x.id,
        title: x.title,
        author: x.artist_title,
        thumbnail: x.thumbnail?.lqip
      }))
    }

    return artworks;
  } catch (error) {
    return error?.response.data;
  }
}

export async function getArtwork(id: number) {
  try {
    const axiosResponse = await axios.get(url + `/${id}`);

    return {
      id: axiosResponse.data.data.id,
      title: axiosResponse.data.data.title,
      author: axiosResponse.data.data.artist_title,
      thumbnail: axiosResponse.data.data.thumbnail?.lqip
    };
  } catch (error) {
    return error?.response?.data;
  }
}