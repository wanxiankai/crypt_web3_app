import { useEffect, useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_GIPHY_API;

const useFetch = ({ keyword }) => {
    const [gifUrl, setGifUrl] = useState('');

    const fetchGifs = useCallback(async () => {
        try {
            const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${keyword.split(' ').join('')}&limit=1`);
            const { data } = await res.json();
            setGifUrl(data[0]?.images?.downsized_medium?.url);
        } catch (error) {
            setGifUrl('https://metro.co.uk/wp-content/uploads/2015/05/pokemon_crying.gif?quality=90&strip=all&zoom=1&resize=500%2C284')
        }
    }, [keyword])


    useEffect(() => {
        if (keyword) fetchGifs();
    }, [keyword, fetchGifs])

    return gifUrl
}

export default useFetch;