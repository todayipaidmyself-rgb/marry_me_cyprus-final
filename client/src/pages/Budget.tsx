import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function Budget() {
  const utils = trpc.useUtils();

  // Budget setup state
  const [totalBudget, setTotalBudget] = useState("");
  const [currency, setCurrency] = useState<"EUR" | "GBP">("EUR");

  // Expense modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseVendor, setExpenseVendor] = useState("");
  const [expenseCost, setExpenseCost] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");

  // Queries
  const { data: budget, isLoading: budgetLoading } = trpc.budget.get.useQuery();
  const { data: categories = [], isLoading: categoriesLoading } =
    trpc.budget.getCategories.useQuery();

  // Mutations
  const upsertBudget = trpc.budget.upsert.useMutation({
    onSuccess: () => {
      utils.budget.get.invalidate();
    },
  });

  const initializeCategories = trpc.budget.initializeCategories.useMutation({
    onSuccess: () => {
      utils.budget.getCategories.invalidate();
    },
  });

  const upsertCategory = trpc.budget.upsertCategory.useMutation({
    onSuccess: () => {
      utils.budget.getCategories.invalidate();
    },
  });

  const createExpense = trpc.budget.createExpense.useMutation({
    onSuccess: () => {
      utils.budget.getCategories.invalidate();
      setExpenseModalOpen(false);
      resetExpenseForm();
    },
  });

  // Reset expense form
  const resetExpenseForm = () => {
    setExpenseTitle("");
    setExpenseVendor("");
    setExpenseCost("");
    setExpenseDate("");
    setExpenseNotes("");
    setSelectedCategoryId(null);
  };

  // Handle expense submission
  const handleSubmitExpense = () => {
    if (!selectedCategoryId || !expenseTitle || !expenseCost || !expenseDate) {
      return;
    }

    const cost = parseFloat(expenseCost);
    if (isNaN(cost) || cost < 0) {
      return;
    }

    createExpense.mutate({
      categoryId: selectedCategoryId,
      title: expenseTitle,
      vendor: expenseVendor || null,
      cost: Math.round(cost * 100), // Convert to cents
      date: expenseDate,
      notes: expenseNotes || null,
    });
  };

  // Open expense modal for a category
  const openExpenseModal = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setExpenseDate(new Date().toISOString().split("T")[0]); // Set today's date
    setExpenseModalOpen(true);
  };

  // Load budget data
  useEffect(() => {
    if (budget) {
      setTotalBudget((budget.totalBudget / 100).toString());
      setCurrency(budget.currency);
    }
  }, [budget]);

  // Initialize categories if empty
  useEffect(() => {
    if (!categoriesLoading && categories.length === 0) {
      initializeCategories.mutate();
    }
  }, [categories, categoriesLoading]);

  // Handle budget save
  const handleSaveBudget = () => {
    const amount = parseFloat(totalBudget);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    upsertBudget.mutate({
      totalBudget: Math.round(amount * 100), // Convert to cents
      currency,
    });
  };

  // Calculate totals
  const totalAllocated = categories.reduce(
    (sum, cat) => sum + cat.allocatedAmount,
    0
  );
  const totalSpent = categories.reduce((sum, cat) => sum + cat.actualSpend, 0);
  const budgetAmount = budget?.totalBudget || 0;
  const remaining = budgetAmount - totalSpent;

  // Format currency
  const formatCurrency = (amount: number) => {
    const symbol = currency === "EUR" ? "€" : "£";
    return `${symbol}${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get progress color
  const getProgressColor = (allocated: number, spent: number) => {
    if (allocated === 0) return "bg-[#C6B4AB]/20";
    const percentage = (spent / allocated) * 100;
    if (percentage > 100) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-[#C6B4AB]";
  };

  // Handle category update
  const handleUpdateCategory = (
    id: number,
    field: "allocatedAmount" | "notes",
    value: string | number
  ) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    upsertCategory.mutate({
      id,
      categoryName: category.categoryName,
      allocatedAmount:
        field === "allocatedAmount"
          ? typeof value === "number"
            ? value
            : Math.round(parseFloat(value as string) * 100)
          : category.allocatedAmount,
      actualSpend: category.actualSpend,
      notes: field === "notes" ? (value as string) : category.notes,
    });
  };

  if (budgetLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C6B4AB] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl text-white mb-4">
            Wedding Budget
          </h1>
          <p className="text-white/70 text-lg">
            Track your spending and stay on budget for your dream wedding
          </p>
        </div>

        {/* Budget Setup Section */}
        <div className="mb-12 border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
          <h2 className="font-serif text-3xl text-white mb-6">Budget Setup</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <Label htmlFor="totalBudget" className="text-white/90 mb-3 block">
                Total Wedding Budget
              </Label>
              <Input
                id="totalBudget"
                type="number"
                value={totalBudget}
                onChange={e => setTotalBudget(e.target.value)}
                onBlur={handleSaveBudget}
                className="bg-white/5 border-white/20 text-white text-xl h-14"
                placeholder="Enter your total budget"
              />
            </div>

            <div>
              <Label htmlFor="currency" className="text-white/90 mb-3 block">
                Currency
              </Label>
              <Select
                value={currency}
                onValueChange={val => {
                  setCurrency(val as "EUR" | "GBP");
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white h-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {budget && (
            <div className="flex items-center justify-between p-6 bg-[#C6B4AB]/10 rounded-lg border border-[#C6B4AB]/20">
              <div>
                <p className="text-white/70 text-sm mb-1">Remaining Budget</p>
                <p
                  className={`font-serif text-4xl ${remaining < 0 ? "text-red-500" : "text-[#C6B4AB]"}`}
                >
                  {formatCurrency(remaining)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Total Spent</p>
                <p className="text-white text-2xl">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Category Allocation Table */}
        <div className="border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
          <h2 className="font-serif text-3xl text-white mb-6">
            Category Allocation
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-white/70 font-normal">
                    Category
                  </th>
                  <th className="text-right py-4 px-4 text-white/70 font-normal">
                    Allocated
                  </th>
                  <th className="text-right py-4 px-4 text-white/70 font-normal">
                    Spent
                  </th>
                  <th className="text-right py-4 px-4 text-white/70 font-normal">
                    Remaining
                  </th>
                  <th className="text-left py-4 px-4 text-white/70 font-normal">
                    Progress
                  </th>
                  <th className="text-center py-4 px-4 text-white/70 font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => {
                  const categoryRemaining =
                    category.allocatedAmount - category.actualSpend;
                  const percentage =
                    category.allocatedAmount > 0
                      ? (category.actualSpend / category.allocatedAmount) * 100
                      : 0;

                  return (
                    <tr
                      key={category.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">
                          {category.categoryName}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Input
                          type="number"
                          value={(category.allocatedAmount / 100).toString()}
                          onChange={e =>
                            handleUpdateCategory(
                              category.id,
                              "allocatedAmount",
                              e.target.value
                            )
                          }
                          onBlur={e => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              handleUpdateCategory(
                                category.id,
                                "allocatedAmount",
                                val
                              );
                            }
                          }}
                          className="bg-white/5 border-white/10 text-white text-right w-32 ml-auto"
                        />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-white">
                          {formatCurrency(category.actualSpend)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p
                          className={`${categoryRemaining < 0 ? "text-red-500" : "text-white"}`}
                        >
                          {formatCurrency(categoryRemaining)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getProgressColor(category.allocatedAmount, category.actualSpend)}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <p
                            className={`text-sm w-12 text-right ${percentage > 100 ? "text-red-500" : "text-white/70"}`}
                          >
                            {percentage.toFixed(0)}%
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => openExpenseModal(category.id)}
                          className="bg-[#C6B4AB]/20 hover:bg-[#C6B4AB]/30 text-[#C6B4AB] border border-[#C6B4AB]/30"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Expense
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#C6B4AB]/30">
                  <td className="py-6 px-4">
                    <p className="text-white font-serif text-xl">Total</p>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <p className="text-white font-semibold text-lg">
                      {formatCurrency(totalAllocated)}
                    </p>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <p className="text-white font-semibold text-lg">
                      {formatCurrency(totalSpent)}
                    </p>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <p
                      className={`font-semibold text-lg ${remaining < 0 ? "text-red-500" : "text-[#C6B4AB]"}`}
                    >
                      {formatCurrency(remaining)}
                    </p>
                  </td>
                  <td className="py-6 px-4"></td>
                  <td className="py-6 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Budget Insights */}
        {budget && categories.length > 0 && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Spending Categories */}
            <div className="border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
              <h2 className="font-serif text-2xl text-white mb-6">
                Top Spending Categories
              </h2>
              <div className="space-y-4">
                {categories
                  .filter(cat => cat.actualSpend > 0)
                  .sort((a, b) => b.actualSpend - a.actualSpend)
                  .slice(0, 5)
                  .map((category, index) => {
                    const percentage =
                      budgetAmount > 0
                        ? (category.actualSpend / budgetAmount) * 100
                        : 0;
                    return (
                      <div
                        key={category.id}
                        className="flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C6B4AB]/20 flex items-center justify-center">
                          <span className="text-[#C6B4AB] font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-white font-medium">
                              {category.categoryName}
                            </p>
                            <p className="text-white">
                              {formatCurrency(category.actualSpend)}
                            </p>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#C6B4AB]"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {categories.filter(cat => cat.actualSpend > 0).length === 0 && (
                  <p className="text-white/50 text-center py-8">
                    No expenses recorded yet
                  </p>
                )}
              </div>
            </div>

            {/* Categories at Risk */}
            <div className="border border-white/10 rounded-lg p-8 bg-black/40 backdrop-blur-sm">
              <h2 className="font-serif text-2xl text-white mb-6">
                Categories at Risk
              </h2>
              <div className="space-y-4">
                {categories
                  .filter(cat => {
                    if (cat.allocatedAmount === 0) return false;
                    const percentage =
                      (cat.actualSpend / cat.allocatedAmount) * 100;
                    return percentage >= 80;
                  })
                  .sort((a, b) => {
                    const aPercentage =
                      (a.actualSpend / a.allocatedAmount) * 100;
                    const bPercentage =
                      (b.actualSpend / b.allocatedAmount) * 100;
                    return bPercentage - aPercentage;
                  })
                  .map(category => {
                    const percentage =
                      (category.actualSpend / category.allocatedAmount) * 100;
                    const remaining =
                      category.allocatedAmount - category.actualSpend;
                    const isOverBudget = percentage > 100;

                    return (
                      <div
                        key={category.id}
                        className={`p-4 rounded-lg border ${
                          isOverBudget
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-medium">
                            {category.categoryName}
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              isOverBudget ? "text-red-500" : "text-yellow-500"
                            }`}
                          >
                            {percentage.toFixed(0)}%
                          </p>
                        </div>
                        <p className="text-white/70 text-sm">
                          {isOverBudget ? "Over budget by" : "Remaining"}:{" "}
                          {formatCurrency(Math.abs(remaining))}
                        </p>
                      </div>
                    );
                  })}
                {categories.filter(cat => {
                  if (cat.allocatedAmount === 0) return false;
                  const percentage =
                    (cat.actualSpend / cat.allocatedAmount) * 100;
                  return percentage >= 80;
                }).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#C6B4AB] font-medium mb-2">
                      All categories on track!
                    </p>
                    <p className="text-white/50 text-sm">
                      No categories are at risk of going over budget
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
          <DialogContent className="bg-black border border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl text-white">
                Add Expense
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label
                  htmlFor="expenseCategory"
                  className="text-white/90 mb-2 block"
                >
                  Category
                </Label>
                <Select
                  value={selectedCategoryId?.toString() || ""}
                  onValueChange={val => setSelectedCategoryId(parseInt(val))}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="expenseTitle"
                  className="text-white/90 mb-2 block"
                >
                  Expense Title *
                </Label>
                <Input
                  id="expenseTitle"
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="e.g., Venue deposit"
                />
              </div>

              <div>
                <Label
                  htmlFor="expenseVendor"
                  className="text-white/90 mb-2 block"
                >
                  Vendor/Supplier (optional)
                </Label>
                <Input
                  id="expenseVendor"
                  value={expenseVendor}
                  onChange={e => setExpenseVendor(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="e.g., Ktima Alassos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="expenseCost"
                    className="text-white/90 mb-2 block"
                  >
                    Cost *
                  </Label>
                  <Input
                    id="expenseCost"
                    type="number"
                    value={expenseCost}
                    onChange={e => setExpenseCost(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="expenseDate"
                    className="text-white/90 mb-2 block"
                  >
                    Date *
                  </Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="expenseNotes"
                  className="text-white/90 mb-2 block"
                >
                  Notes (optional)
                </Label>
                <Textarea
                  id="expenseNotes"
                  value={expenseNotes}
                  onChange={e => setExpenseNotes(e.target.value)}
                  className="bg-white/5 border-white/20 text-white resize-none"
                  rows={3}
                  placeholder="Add any additional details..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExpenseModalOpen(false);
                    resetExpenseForm();
                  }}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitExpense}
                  disabled={
                    createExpense.isPending ||
                    !selectedCategoryId ||
                    !expenseTitle ||
                    !expenseCost ||
                    !expenseDate
                  }
                  className="bg-[#C6B4AB] hover:bg-[#B5A49A] text-black"
                >
                  {createExpense.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Expense"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
