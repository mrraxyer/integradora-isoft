import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductList from '../pages/ProductList';
import { productService, categoryService } from '../services/api';

//Mockeamos los dos servicios que necesita este componente
vi.mock('../services/api', () => ({
  productService: {
    list: vi.fn(),
    delete: vi.fn()
  },
  categoryService: {
    list: vi.fn()
  }
}));

describe('Pruebas en <ProductList />', () => {

  it('Debe renderizar los productos y los enlaces correctamente', async () => {
    //Preparamos las respuestas simuladas de los endpoints
    categoryService.list.mockResolvedValue({
      data: [{ id: 1, name: 'Electrónica', description: 'Categoría tech' }]
    });

    productService.list.mockResolvedValue({
      data: [
        {
          id: 15,
          name: 'Teclado Mecánico',
          description: 'Teclado RGB',
          price: 120.50,
          stock: 10,
          sku: 'TEC-001'
        }
      ]
    });

    //Renderizamos el componente envuelto en MemoryRouter
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    // 4. Esperamos a que la petición "termine" y se dibuje el producto
    await waitFor(() => {
      expect(screen.getByText('Teclado Mecánico')).toBeInTheDocument();
      expect(screen.getByText('$120.50')).toBeInTheDocument(); 
    });

    //Verificamos que el enlace de React Router se haya generado bien
    //getByRole('link') es la forma más accesible de buscar etiquetas <a>
    const linkElement = screen.getByRole('link', { name: /ver detalle/i });
    expect(linkElement).toBeInTheDocument();
    
    // Validamos que el Link apunte a la URL correcta del producto 15
    expect(linkElement).toHaveAttribute('href', '/producto/15');
  });

  it('Debe mostrar un mensaje cuando no hay productos', async () => {
    categoryService.list.mockResolvedValue({ data: [] });
    // Simulamos que la API devuelve un arreglo vacío
    productService.list.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No hay productos disponibles')).toBeInTheDocument();
    });
  });

});