import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { cartService } from '@/services/cartService';
import { userRepository } from '@/repositories/userRepository';
import { updateCartItemSchema } from '@/validators/cartValidator';

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const validated = updateCartItemSchema.safeParse(body);
    if (!validated.success) {
      const errorMsg = validated.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        { success: false, message: errorMsg, error: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const response = await cartService.updateItemQuantity(user.id, id, validated.data.quantity);
    return NextResponse.json({
      success: true,
      message: 'Cart item quantity updated successfully',
      data: response,
    });
  } catch (error: any) {
    console.error('PATCH /api/cart/items/[id] error:', error);
    
    if (error.code === 'OUT_OF_STOCK') {
      return NextResponse.json(
        { success: false, message: error.message, error: 'OUT_OF_STOCK' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update item quantity.', error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const response = await cartService.removeItem(user.id, id);
    return NextResponse.json({
      success: true,
      message: 'Cart item removed successfully',
      data: response,
    });
  } catch (error: any) {
    console.error('DELETE /api/cart/items/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove item.', error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
