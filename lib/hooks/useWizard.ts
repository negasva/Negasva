'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WizardState, Person } from '@/lib/types';

interface WizardStore extends WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  orderId: string | null;
  isLoading: boolean;
  errors: Record<string, string>;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
  setOrderId: (id: string) => void;

  // Step 1: Style
  setStyle: (styleId: string, styleName: string) => void;

  // Step 2: Body
  setBodyType: (bodyType: 'full_body' | 'torso_only') => void;
  setSkinTone: (skinTone: string) => void;
  setClothingColor: (color: string) => void;
  setBodyAccessories: (accessories: string[]) => void;

  // Step 3: Background
  setBackground: (backgroundId: string, backgroundName: string) => void;

  // Step 4: People
  setPeople: (people: Person[]) => void;
  addPerson: (person: Person) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;

  // Step 5: Details
  setMood: (mood: string) => void;
  setExpression: (expression: string) => void;
  setDetailAccessories: (accessories: string[]) => void;
  setSpecialRequests: (requests: string) => void;

  // Step 6: Images
  setImageUrls: (urls: string[]) => void;
  addImageUrl: (url: string) => void;
  removeImageUrl: (url: string) => void;

  // Errors
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;

  // Loading
  setLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: Omit<WizardStore, keyof { [K in keyof WizardStore as WizardStore[K] extends Function ? K : never]: any }> = {
  currentStep: 1,
  orderId: null,
  isLoading: false,
  errors: {},

  styleId: null,
  styleName: null,
  bodyType: null,
  skinTone: null,
  clothingColor: null,
  bodyAccessories: [],

  backgroundId: null,
  backgroundName: null,

  people: [],

  mood: null,
  expression: null,
  detailAccessories: [],
  specialRequests: '',

  imageUrls: [],
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),
      setOrderId: (id) => set({ orderId: id }),

      setStyle: (styleId, styleName) => set({ styleId, styleName }),
      setBodyType: (bodyType) => set({ bodyType }),
      setSkinTone: (skinTone) => set({ skinTone }),
      setClothingColor: (clothingColor) => set({ clothingColor }),
      setBodyAccessories: (bodyAccessories) => set({ bodyAccessories }),

      setBackground: (backgroundId, backgroundName) => set({ backgroundId, backgroundName }),

      setPeople: (people) => set({ people }),
      addPerson: (person) =>
        set((state) => ({
          people: [...state.people, person],
        })),
      removePerson: (id) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
        })),
      updatePerson: (id, updates) =>
        set((state) => ({
          people: state.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      setMood: (mood) => set({ mood: mood as any }),
      setExpression: (expression) => set({ expression: expression as any }),
      setDetailAccessories: (detailAccessories) => set({ detailAccessories }),
      setSpecialRequests: (specialRequests) => set({ specialRequests }),

      setImageUrls: (imageUrls) => set({ imageUrls }),
      addImageUrl: (url) =>
        set((state) => ({
          imageUrls: [...state.imageUrls, url],
        })),
      removeImageUrl: (url) =>
        set((state) => ({
          imageUrls: state.imageUrls.filter((u) => u !== url),
        })),

      setError: (field, message) =>
        set((state) => ({
          errors: { ...state.errors, [field]: message },
        })),
      clearError: (field) =>
        set((state) => {
          const errors = { ...state.errors };
          delete errors[field];
          return { errors };
        }),
      clearErrors: () => set({ errors: {} }),

      setLoading: (isLoading) => set({ isLoading }),

      reset: () => set(initialState),
    }),
    {
      name: 'wizard-store',
      partialize: (state) => ({
        styleId: state.styleId,
        styleName: state.styleName,
        bodyType: state.bodyType,
        skinTone: state.skinTone,
        clothingColor: state.clothingColor,
        bodyAccessories: state.bodyAccessories,
        backgroundId: state.backgroundId,
        backgroundName: state.backgroundName,
        people: state.people,
        mood: state.mood,
        expression: state.expression,
        detailAccessories: state.detailAccessories,
        specialRequests: state.specialRequests,
        imageUrls: state.imageUrls,
        orderId: state.orderId,
      }),
    }
  )
);

export const useWizard = () => useWizardStore();
