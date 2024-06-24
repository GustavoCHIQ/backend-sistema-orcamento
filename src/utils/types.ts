export type Params = {
  id: string;
}

export type CreateBudgetData = {
  userId: number;
  clientId: number;
  totalPrice?: number;
}

export type AddItemData = {
  budgetId: number;
  productId?: number | null;
  serviceId?: number | null;
  quantity: number;
  discount?: number;
  totalPrice?: number;
}

export type ApplyDiscountData = {
  budgetId: number;
  discount: number;
}

export type UpdateBudgetData = {
  isApproved: boolean;
}

export type UpdatePasswordBody = {
  previousPassword: string;
  password: string;
};

export type Quantity = {
  quantity: string;
};

export type CreateBudgetItemBody = {
  budgetId: string;
  productId: string;
  serviceId: string;
  quantity: string;
};