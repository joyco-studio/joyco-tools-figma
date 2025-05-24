import { useCallback, useMemo, useReducer } from "react";
import type {
  TypographyConfig,
  ValidationErrors,
  SizeEntry,
  Variable,
  ScalingMode,
  FontSource,
} from "../types/typography";
import {
  INITIAL_TYPOGRAPHY_STATE,
  INITIAL_VALIDATION_ERRORS,
  INITIAL_MANUAL_SIZE,
} from "../constants/typography";
import {
  validateTypographyConfig,
  createNewManualSize,
  getAvailableStyles,
} from "../utils/typography";

interface TypographyState {
  config: TypographyConfig;
  scalingMode: ScalingMode;
  selectedVariable: Variable | null;
  searchQuery: string;
  isExpanded: boolean;
  isEditingName: boolean;
  errors: ValidationErrors;
  popoverStates: {
    fonts: boolean;
    styles: boolean;
    ratio: boolean;
  };
}

type TypographyAction =
  | { type: "SET_CONFIG"; payload: Partial<TypographyConfig> }
  | { type: "SET_SCALING_MODE"; payload: ScalingMode }
  | { type: "SET_VARIABLE"; payload: Variable | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_EXPANDED"; payload: boolean }
  | { type: "SET_EDITING_NAME"; payload: boolean }
  | { type: "SET_ERRORS"; payload: ValidationErrors }
  | { type: "CLEAR_ERROR"; payload: keyof ValidationErrors }
  | {
      type: "SET_POPOVER";
      payload: { key: keyof TypographyState["popoverStates"]; value: boolean };
    }
  | {
      type: "ADD_MANUAL_SIZE";
      payload: { availableStyles: string[]; defaultRatio: number };
    }
  | { type: "REMOVE_MANUAL_SIZE"; payload: string }
  | {
      type: "UPDATE_MANUAL_SIZE";
      payload: { id: string; field: keyof SizeEntry; value: any };
    }
  | { type: "TOGGLE_STYLE"; payload: string }
  | { type: "SET_ALL_STYLES"; payload: string[] }
  | { type: "RESET" };

const initialState: TypographyState = {
  config: {
    ...INITIAL_TYPOGRAPHY_STATE,
    manualSizes: [{ ...INITIAL_MANUAL_SIZE, id: "1" }],
  },
  scalingMode: "auto",
  selectedVariable: null,
  searchQuery: "",
  isExpanded: true,
  isEditingName: false,
  errors: INITIAL_VALIDATION_ERRORS,
  popoverStates: {
    fonts: false,
    styles: false,
    ratio: false,
  },
};

function typographyReducer(
  state: TypographyState,
  action: TypographyAction
): TypographyState {
  switch (action.type) {
    case "SET_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case "SET_SCALING_MODE":
      return {
        ...state,
        scalingMode: action.payload,
        config: {
          ...state.config,
          isManualScale: action.payload === "manual",
        },
      };

    case "SET_VARIABLE":
      return {
        ...state,
        selectedVariable: action.payload,
        config: {
          ...state.config,
          fontSource: action.payload ? "variable" : "type",
          variableId: action.payload?.id,
        },
      };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_EXPANDED":
      return { ...state, isExpanded: action.payload };

    case "SET_EDITING_NAME":
      return { ...state, isEditingName: action.payload };

    case "SET_ERRORS":
      return { ...state, errors: action.payload };

    case "CLEAR_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: undefined },
      };

    case "SET_POPOVER":
      return {
        ...state,
        popoverStates: {
          ...state.popoverStates,
          [action.payload.key]: action.payload.value,
        },
      };

    case "ADD_MANUAL_SIZE":
      const newSize = createNewManualSize(
        state.config.manualSizes || [],
        action.payload.availableStyles,
        action.payload.defaultRatio
      );
      return {
        ...state,
        config: {
          ...state.config,
          manualSizes: [...(state.config.manualSizes || []), newSize],
        },
      };

    case "REMOVE_MANUAL_SIZE":
      return {
        ...state,
        config: {
          ...state.config,
          manualSizes: state.config.manualSizes?.filter(
            (size) => size.id !== action.payload
          ),
        },
      };

    case "UPDATE_MANUAL_SIZE":
      return {
        ...state,
        config: {
          ...state.config,
          manualSizes: state.config.manualSizes?.map((size) =>
            size.id === action.payload.id
              ? { ...size, [action.payload.field]: action.payload.value }
              : size
          ),
        },
      };

    case "TOGGLE_STYLE":
      const currentStyles = state.config.styles;
      const newStyles = currentStyles.includes(action.payload)
        ? currentStyles.filter((s) => s !== action.payload)
        : [...currentStyles, action.payload];

      return {
        ...state,
        config: { ...state.config, styles: newStyles },
      };

    case "SET_ALL_STYLES":
      return {
        ...state,
        config: { ...state.config, styles: action.payload },
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useTypographyState() {
  const [state, dispatch] = useReducer(typographyReducer, initialState);

  const actions = useMemo(
    () => ({
      setConfig: (payload: Partial<TypographyConfig>) =>
        dispatch({ type: "SET_CONFIG", payload }),

      setScalingMode: (mode: ScalingMode) =>
        dispatch({ type: "SET_SCALING_MODE", payload: mode }),

      setVariable: (variable: Variable | null) =>
        dispatch({ type: "SET_VARIABLE", payload: variable }),

      setSearchQuery: (query: string) =>
        dispatch({ type: "SET_SEARCH_QUERY", payload: query }),

      setExpanded: (expanded: boolean) =>
        dispatch({ type: "SET_EXPANDED", payload: expanded }),

      setEditingName: (editing: boolean) =>
        dispatch({ type: "SET_EDITING_NAME", payload: editing }),

      setErrors: (errors: ValidationErrors) =>
        dispatch({ type: "SET_ERRORS", payload: errors }),

      clearError: (field: keyof ValidationErrors) =>
        dispatch({ type: "CLEAR_ERROR", payload: field }),

      setPopover: (
        key: keyof TypographyState["popoverStates"],
        value: boolean
      ) => dispatch({ type: "SET_POPOVER", payload: { key, value } }),

      addManualSize: (availableStyles: string[], defaultRatio: number) =>
        dispatch({
          type: "ADD_MANUAL_SIZE",
          payload: { availableStyles, defaultRatio },
        }),

      removeManualSize: (id: string) =>
        dispatch({ type: "REMOVE_MANUAL_SIZE", payload: id }),

      updateManualSize: (id: string, field: keyof SizeEntry, value: any) =>
        dispatch({ type: "UPDATE_MANUAL_SIZE", payload: { id, field, value } }),

      toggleStyle: (style: string) =>
        dispatch({ type: "TOGGLE_STYLE", payload: style }),

      setAllStyles: (styles: string[]) =>
        dispatch({ type: "SET_ALL_STYLES", payload: styles }),

      reset: () => dispatch({ type: "RESET" }),
    }),
    []
  );

  const validate = useCallback(
    (availableStyles: string[]) => {
      const errors = validateTypographyConfig(
        state.config,
        state.scalingMode,
        availableStyles
      );
      actions.setErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [state.config, state.scalingMode, actions]
  );

  return {
    state,
    actions,
    validate,
    isValid: useMemo(
      () => Object.keys(state.errors).length === 0,
      [state.errors]
    ),
  };
}
