"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArtwork = exports.listArtworks = void 0;
const axios_1 = __importDefault(require("axios"));
const url = "https://api.artic.edu/api/v1/artworks";
async function listArtworks(pageNumber, pageSize) {
    const params = {
        page: pageNumber,
        limit: pageSize
    };
    try {
        const axiosResponse = await axios_1.default.get(url, {
            params
        });
        /* return pagination info alongside with real data in case users want to write a script that loops through all the pages */
        const artworks = {
            pagination: axiosResponse.data.pagination,
            data: axiosResponse.data.data.map((x) => ({
                id: x.id,
                title: x.title,
                author: x.artist_title,
                thumbnail: x.thumbnail?.lqip
            }))
        };
        return artworks;
    }
    catch (error) {
        return error?.response.data;
    }
}
exports.listArtworks = listArtworks;
async function getArtwork(id) {
    try {
        const axiosResponse = await axios_1.default.get(url + `/${id}`);
        return {
            id: axiosResponse.data.data.id,
            title: axiosResponse.data.data.title,
            author: axiosResponse.data.data.artist_title,
            thumbnail: axiosResponse.data.data.thumbnail?.lqip
        };
    }
    catch (error) {
        return error?.response?.data;
    }
}
exports.getArtwork = getArtwork;
