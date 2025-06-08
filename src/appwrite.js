import { Client, Databases, Query, ID } from "appwrite";

const DATABSE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
client.setEndpoint(ENDPOINT)
client.setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async(searchTerm, movie) =>{
    
    //check if searchTerm exists
    try {
        const result = await database.listDocuments(DATABSE_ID, COLLECTION_ID,[Query.equal('searchTerm', searchTerm)])
        if(result.documents.length>0){
            const doc = result.documents[0];
            await database.updateDocument(DATABSE_ID,COLLECTION_ID,doc.$id, {
                count:doc.count+1,
            })
        }else{
            await database.createDocument(DATABSE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count:1,
                movie_id:movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
        
    } catch (error) {
        console.log(error);
        console.log(PROJECT_ID)
    }
}

export const getTrendingMovies = async()=>{
    try {
        const result = await database.listDocuments(DATABSE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")

        ])
        return result.documents;
    } catch (error) {
        console.log(error);
    }
}