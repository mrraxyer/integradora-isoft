import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryList from '../pages/CategoryList';
import { AuthProvider } from '../context/AuthContext'
import { categoryService } from '../services/api';

// 1. Simulamos el archivo de la API
vi.mock('../services/api', () => ({
  default: { defaults: { headers: { common: {} } } },
  categoryService: {
    list: vi.fn()
  }
}));

describe('Pruebas en <CategoryList />', () => {
  
  it('Debe mostrar "Cargando categorías..." al inicio', () => {
    // Le decimos al mock que la promesa se quede "pensando"
    categoryService.list.mockImplementation(() => new Promise(() => {}));
    
    render(
      <AuthProvider>
        <CategoryList />
      </AuthProvider>
    );
    
    expect(screen.getByText('Cargando categorías...')).toBeInTheDocument();
  });

  it('Debe mostrar la tabla con las categorías cuando la API responde con éxito', async () => {
    // Simulamos una respuesta exitosa del backend
    const mockCategorias = {
      data: { data: [
        { id: 1, name: 'Electrónica', description: 'Cables y PCs' },
        { id: 2, name: 'Ropa', description: 'Camisas y pantalones' }
      ] }
    };
    categoryService.list.mockResolvedValue(mockCategorias);

    render(
      <AuthProvider>
        <CategoryList />
      </AuthProvider>
    );

    // Esperamos a que el componente termine de cargar y dibuje los nombres
    await waitFor(() => {
      expect(screen.getByText('Electrónica')).toBeInTheDocument();
      expect(screen.getByText('Ropa')).toBeInTheDocument();
    });
    
    // Verificamos que el estado de carga haya desaparecido
    expect(screen.queryByText('Cargando categorías...')).not.toBeInTheDocument();
  });

});