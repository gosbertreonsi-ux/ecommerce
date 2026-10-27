import prisma from "../../config/prisma";

const productInclude = {
  category: true,
  brand: true,
  images: true,
  variants: true,
};

const cartItemInclude = {
  product: {
    include: productInclude,
  },
  variant: true,
};

/*
|--------------------------------------------------------------------------
| GET CART
|--------------------------------------------------------------------------
*/

export const getCart = async (
  userId: number,
) => {
  let cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include:
            cartItemInclude,
        },
      },
    });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include:
            cartItemInclude,
        },
      },
    });
  }

  return cart;
};

/*
|--------------------------------------------------------------------------
| ADD ITEM TO CART
|--------------------------------------------------------------------------
*/

export const addItem = async (
  userId: number,
  productId: number,
  variantId: number,
  quantity: number,
) => {
  const product =
    await prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      include: {
        variants: true,
      },
    });

  if (!product) {
    throw new Error(
      "Product not found",
    );
  }

  if (!product.isActive) {
    throw new Error(
      "Product is not available",
    );
  }

  const variant =
    product.variants.find(
      (item) =>
        item.id === variantId,
    );

  if (!variant) {
    throw new Error(
      "Selected product variant not found",
    );
  }

  if (variant.stock <= 0) {
    throw new Error(
      "Selected variant is out of stock",
    );
  }

  if (
    quantity >
    variant.stock
  ) {
    throw new Error(
      `Insufficient stock. Available: ${variant.stock}`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | GET OR CREATE CART
  |--------------------------------------------------------------------------
  */

  let cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK EXISTING VARIANT
  |--------------------------------------------------------------------------
  */

  const existingItem =
    await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

  if (existingItem) {
    const newQuantity =
      existingItem.quantity +
      quantity;

    if (
      newQuantity >
      variant.stock
    ) {
      throw new Error(
        `Insufficient stock. Available: ${variant.stock}, already in cart: ${existingItem.quantity}`,
      );
    }

    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity:
          newQuantity,
      },
      include:
        cartItemInclude,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE CART ITEM
  |--------------------------------------------------------------------------
  */

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId,
      quantity,
    },
    include:
      cartItemInclude,
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE CART ITEM
|--------------------------------------------------------------------------
*/

export const updateItem = async (
  userId: number,
  variantId: number,
  quantity: number,
) => {
  const cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    throw new Error(
      "Cart not found",
    );
  }

  const item =
    await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
      include: {
        product: true,
        variant: true,
      },
    });

  if (!item) {
    throw new Error(
      "Cart item not found",
    );
  }

  if (!item.variant) {
    throw new Error(
      "Cart item has no product variant configured",
    );
  }

  if (!item.product.isActive) {
    throw new Error(
      "Product is not available",
    );
  }

  if (
    item.variant.stock <= 0
  ) {
    throw new Error(
      "Selected variant is out of stock",
    );
  }

  if (
    quantity >
    item.variant.stock
  ) {
    throw new Error(
      `Insufficient stock. Available: ${item.variant.stock}`,
    );
  }

  return prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,
    },
    include:
      cartItemInclude,
  });
};

/*
|--------------------------------------------------------------------------
| REMOVE ITEM
|--------------------------------------------------------------------------
*/

export const removeItem = async (
  userId: number,
  variantId: number,
) => {
  const cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    throw new Error(
      "Cart not found",
    );
  }

  const item =
    await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

  if (!item) {
    throw new Error(
      "Cart item not found",
    );
  }

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });

  return {
    message:
      "Item removed from cart",
  };
};

/*
|--------------------------------------------------------------------------
| CLEAR CART
|--------------------------------------------------------------------------
*/

export const clearCart = async (
  userId: number,
) => {
  const cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    return {
      message:
        "Cart cleared",
    };
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return {
    message:
      "Cart cleared",
  };
};