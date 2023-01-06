/*
    Created by Simone Scionti 
    interface for models that need to create a GSI json property to store it in the db and uses it for a GSI 
*/
export interface RecordModelGSIInterface{
    createGSIAttributes() : void;
}