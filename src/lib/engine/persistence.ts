import { supabase } from '@/lib/supabase';
import type { BrandBrain } from './types';

export interface SavedBusiness {
  id: string;
  name: string;
  url: string;
  brand_voice: string;
  colors: BrandBrain['colors'];
  value_props: string[];
  created_at: string;
}

/**
 * Persists a BrandBrain to the `businesses` table.
 * Maps BrandBrain fields to the existing schema columns.
 *
 * NOTE FOR ANTIGRAVITY: The BrandBrain contains additional fields not yet in
 * the schema (description, target_audience, industry, products_services,
 * calls_to_action, social_handles). Consider adding a `metadata JSONB` column
 * to `businesses` to store these without requiring individual columns.
 *
 * @param brandBrain - The structured brand profile from the analyzer
 * @param userId - The authenticated user's UUID (from Supabase Auth)
 * @returns The saved database record
 */
export async function saveBrandBrain(
  brandBrain: BrandBrain,
  userId: string
): Promise<SavedBusiness> {
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      user_id: userId,
      name: brandBrain.name,
      url: brandBrain.url,
      brand_voice: brandBrain.brand_voice,
      colors: brandBrain.colors,
      value_props: brandBrain.value_props,
      metadata: {
        description: brandBrain.description,
        target_audience: brandBrain.target_audience,
        industry: brandBrain.industry,
        products_services: brandBrain.products_services,
        calls_to_action: brandBrain.calls_to_action,
        social_handles: brandBrain.social_handles,
      },
    })
    .select('id, name, url, brand_voice, colors, value_props, metadata, created_at')
    .single();

  if (error) {
    throw new Error(`Failed to save BrandBrain to Supabase: ${error.message}`);
  }

  return data as SavedBusiness;
}

/**
 * Upserts a BrandBrain — updates if a record with the same user_id + url exists,
 * inserts otherwise. Useful when re-analyzing an existing brand.
 */
export async function upsertBrandBrain(
  brandBrain: BrandBrain,
  userId: string
): Promise<SavedBusiness> {
  const { data, error } = await supabase
    .from('businesses')
    .upsert(
      {
        user_id: userId,
        name: brandBrain.name,
        url: brandBrain.url,
        brand_voice: brandBrain.brand_voice,
        colors: brandBrain.colors,
        value_props: brandBrain.value_props,
        metadata: {
          description: brandBrain.description,
          target_audience: brandBrain.target_audience,
          industry: brandBrain.industry,
          products_services: brandBrain.products_services,
          calls_to_action: brandBrain.calls_to_action,
          social_handles: brandBrain.social_handles,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,url' }
    )
    .select('id, name, url, brand_voice, colors, value_props, metadata, created_at')
    .single();

  if (error) {
    throw new Error(`Failed to upsert BrandBrain to Supabase: ${error.message}`);
  }

  return data as SavedBusiness;
}
