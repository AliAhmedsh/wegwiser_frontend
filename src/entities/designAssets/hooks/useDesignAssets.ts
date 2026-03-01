import { showToast } from '@/lib/utils/toast';
import { useCallback, useEffect, useState } from 'react';
import { DesignAsset, designAssetsService } from '../api/designAssetsService';

interface UseDesignAssetsReturn {
  assets: DesignAsset[];
  loading: boolean;
  error: string | null;
  uploadAsset: (workspaceId: number, name: string, file: File) => Promise<void>;
  deleteAsset: (assetId: number) => Promise<void>;
  associateWithVehicle: (assetId: number, vehicleId: number) => Promise<void>;
  disassociateFromVehicle: (assetId: number, vehicleId: number) => Promise<void>;
  refreshAssets: () => Promise<void>;
}

export function useDesignAssets(
  workspaceId?: number,
  productId?: number,
  filters?: { type?: string; search?: string; vehicleId?: number },
  refreshTrigger: number = 0
): UseDesignAssetsReturn {
  const [assets, setAssets] = useState<DesignAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!workspaceId && !productId) {
      setAssets([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (workspaceId) {
        response = await designAssetsService.getDesignAssets(workspaceId, filters);
      } else if (productId) {
        response = await designAssetsService.getDesignAssetsByProduct(productId, filters);
      } else {
        setAssets([]);
        return;
      }
      
      if (response.success) {
        setAssets(response.assets);
      } else {
        setError(response.error || 'Failed to fetch assets');
        showToast.error(response.error || 'Failed to fetch assets');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch assets';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, productId, filters?.type, filters?.search]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets, refreshTrigger]);

  const uploadAsset = async (workspaceId: number, name: string, file: File) => {
    try {
      const response = await designAssetsService.uploadDesignAsset(workspaceId, { name, file });
      if (response.success) {
        showToast.success('Asset uploaded successfully');
        await fetchAssets();
      } else {
        showToast.error(response.error || 'Failed to upload asset');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to upload asset';
      showToast.error(errorMsg);
      throw err;
    }
  };

  const deleteAsset = async (assetId: number) => {
    try {
      const response = await designAssetsService.deleteDesignAsset(assetId);
      if (response.success) {
        showToast.success('Asset deleted successfully');
        await fetchAssets();
      } else {
        showToast.error(response.error || 'Failed to delete asset');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to delete asset';
      showToast.error(errorMsg);
      throw err;
    }
  };

  const associateWithVehicle = async (assetId: number, vehicleId: number) => {
    try {
      const response = await designAssetsService.associateAssetWithVehicle({ assetId, vehicleId });
      if (response.success) {
        showToast.success('Asset associated with vehicle');
        await fetchAssets();
      } else {
        showToast.error(response.error || 'Failed to associate asset');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to associate asset';
      showToast.error(errorMsg);
      throw err;
    }
  };

  const disassociateFromVehicle = async (assetId: number, vehicleId: number) => {
    try {
      const response = await designAssetsService.disassociateAssetFromVehicle(assetId, vehicleId);
      if (response.success) {
        showToast.success('Asset disassociated from vehicle');
        await fetchAssets();
      } else {
        showToast.error(response.error || 'Failed to disassociate asset');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to disassociate asset';
      showToast.error(errorMsg);
      throw err;
    }
  };

  return {
    assets,
    loading,
    error,
    uploadAsset,
    deleteAsset,
    associateWithVehicle,
    disassociateFromVehicle,
    refreshAssets: fetchAssets,
  };
}

