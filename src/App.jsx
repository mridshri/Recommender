import Search from "./components/Search.jsx";
import { useDebounce } from "react-use";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinned.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept:'application/json'
  }
}
const App = () => {

  const [searchTerm, setSearchTerm] = useState('')  
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setmovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 500, [searchTerm])
  
  const fetchMovies = async(query='') =>{
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
      ?`${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURI(query)}`
      :`${API_BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&language=es-us`
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      if(data.response === 'false'){
        setErrorMessage(data.error || 'Error fetching movies, please try again');
        setmovieList([]);
        return;
      }
      setmovieList(data.results || []);
      if(query && data.results.length>0){
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies ${error}`);
      setErrorMessage('Error fetching movies, please try again');
    } finally{
      setIsLoading(false);
    }
  }
  const loadTrendingMovies = async()=>{
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetch trending movies: ${error}`);
    }
    
  }
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])
  
  useEffect(()=>{
    loadTrendingMovies();
  }, [])
  return (
    <main>
      <div className="pattern"></div>
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient">Movies</span> you'll enjoy</h1>
          <Search searchTerm ={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length>0 && (
          
          <section className="trending">
            <h2>Trending Movies</h2>      
            <ul>
              {trendingMovies.map((movie,index)=>(
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title}/>
                </li>
              ))}
            </ul>
          </section>
        )
        }
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading?(
           <Spinner />
          ) : errorMessage ? (
            <p className="text-red ">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie)=>(
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
        <h1 className="text-white">{searchTerm}</h1>
      </div>
    </main>
  )
}

export default App