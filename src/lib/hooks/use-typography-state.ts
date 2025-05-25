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
  isEditingName: boolean;
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
  | { type: "SET_EDITING_NAME"; payload: boolean }
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
  isEditingName: false,
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

    case "SET_EDITING_NAME":
      return { ...state, isEditingName: action.payload };

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

  // Stable action creators using individual useCallbacks with empty deps
  const setConfig = useCallback(
    (payload: Partial<TypographyConfig>) =>
      dispatch({ type: "SET_CONFIG", payload }),
    []
  );

  const setScalingMode = useCallback(
    (mode: ScalingMode) =>
      dispatch({ type: "SET_SCALING_MODE", payload: mode }),
    []
  );

  const setVariable = useCallback(
    (variable: Variable | null) =>
      dispatch({ type: "SET_VARIABLE", payload: variable }),
    []
  );

  const setSearchQuery = useCallback(
    (query: string) => dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
    []
  );

  const setEditingName = useCallback(
    (editing: boolean) =>
      dispatch({ type: "SET_EDITING_NAME", payload: editing }),
    []
  );

  const setPopover = useCallback(
    (key: keyof TypographyState["popoverStates"], value: boolean) =>
      dispatch({ type: "SET_POPOVER", payload: { key, value } }),
    []
  );

  const addManualSize = useCallback(
    (availableStyles: string[], defaultRatio: number) =>
      dispatch({
        type: "ADD_MANUAL_SIZE",
        payload: { availableStyles, defaultRatio },
      }),
    []
  );

  const removeManualSize = useCallback(
    (id: string) => dispatch({ type: "REMOVE_MANUAL_SIZE", payload: id }),
    []
  );

  const updateManualSize = useCallback(
    (id: string, field: keyof SizeEntry, value: any) =>
      dispatch({ type: "UPDATE_MANUAL_SIZE", payload: { id, field, value } }),
    []
  );

  const toggleStyle = useCallback(
    (style: string) => dispatch({ type: "TOGGLE_STYLE", payload: style }),
    []
  );

  const setAllStyles = useCallback(
    (styles: string[]) => dispatch({ type: "SET_ALL_STYLES", payload: styles }),
    []
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  // Stable actions object using useMemo with stable dependencies
  const actions = useMemo(
    () => ({
      setConfig,
      setScalingMode,
      setVariable,
      setSearchQuery,
      setEditingName,
      setPopover,
      addManualSize,
      removeManualSize,
      updateManualSize,
      toggleStyle,
      setAllStyles,
      reset,
    }),
    [
      setConfig,
      setScalingMode,
      setVariable,
      setSearchQuery,
      setEditingName,
      setPopover,
      addManualSize,
      removeManualSize,
      updateManualSize,
      toggleStyle,
      setAllStyles,
      reset,
    ]
  );

  return {
    state,
    actions,
  };
}
