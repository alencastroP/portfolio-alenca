export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  /** Quantidade de um estoque cheio — base do percentual da barra. */
  full: number;
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'farinha', name: 'Farinha de trigo', unit: 'g', full: 5000 },
  { id: 'acucar', name: 'Açúcar cristal', unit: 'g', full: 3000 },
  { id: 'ovos', name: 'Ovos', unit: 'un', full: 60 },
  { id: 'chocolate', name: 'Chocolate meio amargo', unit: 'g', full: 1200 },
];

export interface Recipe {
  id: string;
  name: string;
  /** Consumo por unidade produzida, indexado pelo id do insumo. */
  cost: Record<string, number>;
}

export const RECIPES: Recipe[] = [
  {
    id: 'bolo',
    name: 'Bolo de chocolate (1 un)',
    cost: { farinha: 400, acucar: 300, ovos: 4, chocolate: 200 },
  },
  {
    id: 'torta',
    name: 'Torta simples (1 un)',
    cost: { farinha: 300, acucar: 150, ovos: 3 },
  },
];

/** Estoque cheio, pronto para virar estado inicial (e para o botão "Repor"). */
export function fullStock(): Record<string, number> {
  return Object.fromEntries(INGREDIENTS.map((i) => [i.id, i.full]));
}

const byId = new Map(INGREDIENTS.map((i) => [i.id, i]));

export function ingredientById(id: string): Ingredient | undefined {
  return byId.get(id);
}

/** "400g de farinha de trigo · 300g de açúcar cristal · …" */
export function describeCost(recipe: Recipe): string {
  return Object.entries(recipe.cost)
    .map(([id, amount]) => {
      const ingredient = ingredientById(id);
      return ingredient ? `${amount}${ingredient.unit} de ${ingredient.name.toLowerCase()}` : '';
    })
    .filter(Boolean)
    .join(' · ');
}
