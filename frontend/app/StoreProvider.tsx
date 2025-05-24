'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import { makeStore, AppStore } from '../public/store'
import { Persistor } from 'redux-persist/es/types'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(makeStore())
  const persistorRef = useRef<Persistor>(persistStore(storeRef.current))

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  )
}