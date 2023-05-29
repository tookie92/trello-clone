import { databases, storage} from "@/appwrite";
import { getTodosGroupedByColumns } from "@/lib/getTodosGroupedByColumns";

import {create} from "zustand"

interface BoardState{
    board: Board;
    getBoard:()=> void;
    setBoardState:(board: Board)=> void; 
    updateTodoInDB: (todo: Todo, columnId:TypedColumn)=> void;
    image: File | null,
    setImage:(image: File | null)=> void,

    newTaskInput:string;
    setNewTaskInput: (input:string)=> void,

    newTaskType:TypedColumn;
    setNewTaskType: (columnId:TypedColumn)=> void,
    
    searchString: string;
    setSearchString:(searchString: string)=> void;
    
    deleteTask:(taskIndex: number, todoId: Todo, id:TypedColumn)=> void;
}

const useBoardStore = create<BoardState>((set, get)=>({
    board:{
        columns: new Map<TypedColumn, Column>()
    },

    newTaskInput:"",
    setNewTaskInput:(input:string)=> set({newTaskInput: input}),

   image:null,
   setImage:(image:File |null)=> set({image}),

    newTaskType:"todo",
    setNewTaskType:(columnId:TypedColumn)=> set({newTaskType: columnId}),

    searchString: "",
    setSearchString:(searchString)=> set({searchString}),

   getBoard:async()=>{
    const board = await getTodosGroupedByColumns();
    set({board})
   },

   setBoardState:(board)=>set({board}),

   updateTodoInDB: async(todo, columnId)=>{
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id,
            {
                title: todo.title,
                status: columnId,
            }
        )
   },
   deleteTask:async(taskIndex: number, todo: Todo, id: TypedColumn )=>{
    const newColumns = new Map(get().board.columns);

    // delete todoId from new Columns 
    newColumns.get(id)?.todos.splice(taskIndex, 1)
    set({board: {columns: newColumns}});
    if(todo.image){
        await storage.deleteFile(todo.image.bucketId, todo.image.fieldId)
    }

    await databases.deleteDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
        todo.$id
    )

   }
   
}))

export default useBoardStore;