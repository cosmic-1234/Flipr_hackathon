

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import type { PayloadAction } from '@reduxjs/toolkit'

interface authItems  {
    token : string | null,
    isAuthenticated : boolean,
    username : string | null,
    role: string | null,
    email : string | null,
    userId : string | null
}
const init : authItems= {
    isAuthenticated: typeof window !== 'undefined' && localStorage.getItem('token') ? true : false,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    username: null,
    email : null,
    role: "",
    userId : null
}

export const authSlice = createSlice({
    name : "auth", 
    initialState : init,
    reducers : {
        login : (state, action : PayloadAction<authItems>) => {
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.userId = action.payload.userId;
        }, 
        logout : (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.username = null;
            state.email = null;
            state.userId = null;
            state.role = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
              }
        }
    
    }
})
export const { login, logout } = authSlice.actions

export default authSlice.reducer
