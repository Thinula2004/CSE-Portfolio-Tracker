import AppNavigator from './navigation/AppNavigator';
import { useEffect } from 'react';
import { initDatabase } from './data/init';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);
  return <AppNavigator />;
}