'use client';

import { useProductQuery } from '@/entities/product/model/query';
import { useProductStore } from '@/entities/product/store';
import { showToast } from '@/lib/utils/toast';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  const { setChosenProduct } = useProductStore();
  const { user: loggedUser } = useLoginStore();

  const { data: product, isLoading, error } = useProductQuery(productId, !!productId);

  useEffect(() => {
    if (product?.product && !isLoading && !error) {
      setChosenProduct(product.product);
      router.push('/');
    } else if (error) {
      showToast.error('Product not found or you do not have access to it');
      router.push('/');
    }
  }, [product, isLoading, error, setChosenProduct, router]);

  if (isLoading) {
    return (
      <div className="bg-[#EAEDF2] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className={`text-[18px] font-semibold ${poppins.className}`}>
            Loading product...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EAEDF2] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`text-[24px] font-semibold text-red-600 mb-4 ${poppins.className}`}>
            Product Not Found
          </div>
          <div className="text-[16px] text-gray-600 mb-6">
            The product you're looking for doesn't exist or you don't have access to it.
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDF2] flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className={`text-[18px] font-semibold ${poppins.className}`}>
          Redirecting to product...
        </div>
      </div>
    </div>
  );
}
