import React, { useCallback, useMemo, useReducer, Reducer } from "react";
import logo from "./logo.svg";
import "./App.scss";
import * as _ from "lodash";

type RawOption = {
  id: string;
  name: string;
};

type SelectionOption = {
  id: string;
  name: string;
  selected: boolean;
};

const useSelections = () => {
  const fetch = useCallback(() => {
    return [
      { id: "1", name: "dog" },
      { id: "2", name: "cat" },
      { id: "3", name: "turtle" },
    ] as RawOption[];
  }, []);
  return [fetch];
};

const usePreSelections = () => {
  const fetch = useCallback(() => {
    return ["2"];
  }, []);
  return { fetchPreSelectedOptions: fetch };
};

const useLocalStorage = () => {
  const fetch = useCallback(() => {
    return localStorage.getItem("selectedOptions");
  }, []);
  const wipe = useCallback(() => {
    return localStorage.clear();
  }, []);
  const set = useCallback((values: unknown[]) => {
    return localStorage.setItem("selectedOptions", JSON.stringify(values));
  }, []);
  return {
    getLocalStorage: fetch,
    wipeLocalStorage: wipe,
    setLocalStorage: set,
  };
};

function App() {
  // Data Fetching
  const [fetchSelectionOptions] = useSelections();
  const { fetchPreSelectedOptions } = usePreSelections();

  // Local Storage Operations
  const handleWipedSelections = () => {
    const rawSelectionOptions = fetchSelectionOptions();
    const preSelectedOptions = fetchPreSelectedOptions();

    let clonedSelectionOptions = [...rawSelectionOptions];

    setSelections(
      clonedSelectionOptions.map((option) => {
        return Object.assign({}, option, {
          selected: preSelectedOptions.indexOf(option.id) > -1,
        }) as SelectionOption;
      })
    );
  };
  const { getLocalStorage, wipeLocalStorage, setLocalStorage } =
    useLocalStorage();

  // Local State Operations
  const handleSetSelected = (
    state: SelectionOption[],
    newState: SelectionOption[]
  ) => {
    setLocalStorage(
      newState.map((selection: SelectionOption) => {
        return selection.id;
      })
    );
    return newState;
  };
  const [selected, setSelected] = useReducer<Reducer<any, SelectionOption[]>>(
    handleSetSelected,
    []
  );
  const handleSetSelections = (
    state: SelectionOption[],
    newState: SelectionOption[]
  ) => {
    const nextSelections = [...newState].filter((option) => {
      return option.selected;
    });
    setSelected(nextSelections);
    return newState;
  };
  const [selections, setSelections] = useReducer<
    Reducer<any, SelectionOption[]>
  >(handleSetSelections, []);

  // UI Listeners
  const handleSelection = (selection: any) => {
    const thisSelection = Object.assign({}, selection, {
      selected: !selection.selected,
    });
    const updatedSelections = selections.map((option: SelectionOption) => {
      if (option.id === thisSelection.id) {
        return thisSelection;
      } else {
        return option;
      }
    });
    setSelections(updatedSelections);
  };

  // Lifecycle Hooks
  useMemo(() => {
    const rawSelectionOptions = fetchSelectionOptions();
    const preSelectedOptions = fetchPreSelectedOptions();
    const lastSelectedOptions = getLocalStorage();

    let clonedSelectionOptions = [...rawSelectionOptions];

    if (lastSelectedOptions && lastSelectedOptions.length > 0) {
      setSelections(
        clonedSelectionOptions.map((option) => {
          return Object.assign({}, option, {
            selected: lastSelectedOptions.indexOf(option.id) > -1,
          }) as SelectionOption;
        })
      );
    } else {
      setSelections(
        clonedSelectionOptions.map((option) => {
          return Object.assign({}, option, {
            selected: preSelectedOptions.indexOf(option.id) > -1,
          }) as SelectionOption;
        })
      );
    }
  }, [fetchSelectionOptions, fetchPreSelectedOptions, getLocalStorage]);

  return (
    <div className="App">
      MY SELECTIONS
      <button
        onClick={() => {
          wipeLocalStorage();
          handleWipedSelections();
        }}
      >
        Reset
      </button>
      {selections.map((option: SelectionOption) => {
        return (
          <label>
            <p>{option.name}</p>
            <input
              type="checkbox"
              className="uk-checkbox"
              checked={option.selected}
              onChange={() => {
                handleSelection(option);
              }}
            ></input>
          </label>
        );
      })}
    </div>
  );
}

export default App;
