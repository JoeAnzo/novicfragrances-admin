import type { LoginInput } from '../schemas/login.schema';
import { supabase } from '../config/config';


export const signInWithEmail = async (credentials: LoginInput) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected authentication error occurred.';
    return { success: false, error: message };
  }
};


export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
};





export async function uploadAndSaveCompleteProduct(
  imageFiles: File[],
  productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    brand?: string;
    stock_quantity: number;
    is_active: boolean;
    longevity?: string;
    sillage?: string;
    scent_family?: string;
    top_notes?: string;
    middle_notes?: string;
    base_notes?: string;
  },
  ) {
  const storageBucket = 'product_images';
  const uploadedPaths: string[] = [];
  let productId: string | null = null;
  let completed = false;

  if (imageFiles.length < 3) {
    throw new Error('Please upload at least 3 product images');
  }

  if (imageFiles.some((file) => !file.type.startsWith('image/'))) {
    throw new Error('Only image files can be uploaded');
  }

  if (imageFiles.some((file) => file.size > 10 * 1024 * 1024)) {
    throw new Error('Each product image must be 10 MB or smaller');
  }

  try {
    const uploadResults: string[] = [];

    for (const file of imageFiles) {
      const filePath = `products/${crypto.randomUUID()}`;
      const { error } = await supabase.storage.from(storageBucket).upload(filePath, file);

      if (error) throw error;

      uploadedPaths.push(filePath);
      uploadResults.push(
        supabase.storage.from(storageBucket).getPublicUrl(filePath).data.publicUrl,
      );
    }

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        brand: productData.brand || null,
        image_urls: uploadResults,
        stock_quantity: productData.stock_quantity,
        is_active: productData.is_active,
      })
      .select('id')
      .single();

    if (productError) throw productError;
    productId = newProduct.id;

    const { error: detailsError } = await supabase
      .from('product_details')
      .insert({
        product_id: newProduct.id,
        longevity: productData.longevity || null,
        sillage: productData.sillage || null,
        scent_family: productData.scent_family || null,
        top_notes: productData.top_notes || null,
        middle_notes: productData.middle_notes || null,
        base_notes: productData.base_notes || null,
      });

    if (detailsError) throw detailsError;

    completed = true;
    return newProduct;
  } catch (error) {
    if (productId) {
      await supabase.from('products').delete().eq('id', productId);
    }

    throw error;
  } finally {
    if (!completed && uploadedPaths.length > 0) {
      await supabase.storage.from(storageBucket).remove(uploadedPaths);
    }
  }
}


// Number of Customers

export async function getNumberOfCustomers(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching number of customers:', error);
    throw error;
  }
}

//Number of Orders

export async function getNumberOfOrders(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error fetching number of orders:', error);
    throw error;
  }
}