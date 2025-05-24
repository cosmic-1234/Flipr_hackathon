
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { authSlice } from './features/authSlice'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const rootReducer = combineReducers({
  auth: authSlice.reducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // persist only the auth slice
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  })

export const store = makeStore()
export const persistor = persistStore(store)

// Types
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']