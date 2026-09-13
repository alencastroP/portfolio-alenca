export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export const DEL_MENU: MenuItem[] = [
  { id: 'pizza', name: 'Pizza calabresa · grande', price: 54.9 },
  { id: 'burger', name: 'Hambúrguer artesanal cheddar', price: 32.5 },
  { id: 'fritas', name: 'Porção de fritas com bacon', price: 26.0 },
  { id: 'refri', name: 'Refrigerante lata 350ml', price: 7.5 },
];
