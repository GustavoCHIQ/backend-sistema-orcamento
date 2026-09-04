export type Params = {
  id: string;
};

export type BudgetItemParams = {
  budgetId: string;
  itemId: string;
};

export type CreateBudgetData = {
  clientId: number;
  totalPrice?: number;
  validUntil?: string;
}

export type AddItemData = {
  budgetId: number;
  productId?: number | null;
  serviceId?: number | null;
  quantity: number;
  discount?: number;
  totalPrice?: number;
}

export type UpdateBudgetItemData = {
  quantity?: number;
  discount?: number;
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
  confirmPassword: string;
};

export type Login = {
  email: string;
  password: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ResetPasswordBody = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

export type BudgetListQuery = {
  page?: string;
  limit?: string;
  status?: string;
  clientId?: string;
  userId?: string;
};

export type DashboardQuery = {
  from?: string;
  to?: string;
};

export type AuditLogQuery = {
  page?: string;
  limit?: string;
  userId?: string;
  entity?: string;
  entityId?: string;
  action?: string;
  from?: string;
  to?: string;
};
