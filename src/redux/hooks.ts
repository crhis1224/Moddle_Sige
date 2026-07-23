import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Usar estos hooks tipados en lugar de los originales de 'react-redux'
// Esto asegura que useSelector y useDispatch conozcan la estructura de tu store.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;