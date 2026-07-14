import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { cartService } from '@/services/cartService';
import { userRepository } from '@/repositories/userRepository';
import { addToCartSchema } from '@/validators/cartValidator';

// Helper to authenticate user and sync/get DB profile
async function getAuthenticatedUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let dbUser = await userRepository.findByClerkId(clerkId);
  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;
    
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
    
    dbUser = await userRepository.create({
      clerkId,
      email,
      fullName,
      profileImage: clerkUser.imageUrl,
    });
  }
  return dbUser;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const response = await cartService.getCart(user.id);
    return NextResponse.json({
      success: true,
      message: 'Cart fetched successfully',
      data: response,
    });
  } catch (error: any) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch cart.', error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Check if it's a guest cart merge request
    if (body.guestItems && Array.isArray(body.guestItems)) {
      const response = await cartService.mergeCart(user.id, body.guestItems);
      return NextResponse.json({
        success: true,
        message: 'Cart merged successfully',
        data: response,
      });
    }

    // Otherwise, validate single item addition
    const validated = addToCartSchema.safeParse(body);
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        { success: false, message: errorMsg, error: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const response = await cartService.addToCart(user.id, validated.data.productId, validated.data.quantity);
    return NextResponse.json({
      success: true,
      message: 'Product added to cart successfully',
      data: response,
    });
  } catch (error: any) {
    console.error('POST /api/cart error:', error);
    
    if (error.code === 'OUT_OF_STOCK') {
      return NextResponse.json(
        { success: false, message: error.message, error: 'OUT_OF_STOCK' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update cart.', error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const response = await cartService.clearCart(user.id);
    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
      data: response,
    });
  } catch (error: any) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to clear cart.', error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
