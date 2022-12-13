const ReactDOM = (function () {
  let _container;
  let _Component;

  return {
    update() {
      this.render(_container, _Component);
    },
    render(container, Component) {
      _container = container;
      _Component = Component;

      const focusedElementId = document.activeElement.id;
      const focusedElementSelectionStart =
        document.activeElement.selectionStart;
      const focusedElementSelectionEnd = document.activeElement.selectionEnd;

      const componentDOM = React.render(Component);
      container.replaceChildren();
      container.appendChild(componentDOM);

      if (focusedElementId) {
        const focusedElement = document.getElementById(focusedElementId);
        focusedElement.focus();
        focusedElement.selectionStart = focusedElementSelectionStart;
        focusedElement.selectionEnd = focusedElementSelectionEnd;
      }
    },
  };
})();

const React = (function () {
  let hooks = [];
  let currentIndex = 0;

  return {
    render(Component) {
      currentIndex = 0;

      const Comp = Component();
      return Comp;
    },
    useState(initialValue) {
      const useStateIndex = currentIndex;
      currentIndex++;

      hooks[useStateIndex] = hooks[useStateIndex] ?? initialValue;

      const setState = (newVal) => {
        const newState =
          typeof newVal === "function" ? newVal(hooks[useStateIndex]) : newVal;
        hooks[useStateIndex] = newState;
        ReactDOM.update();
      };

      return [hooks[useStateIndex], setState];
    },
    useReducer(reducer, initialState) {
      const useReducerIndex = currentIndex;
      currentIndex++;

      hooks[useReducerIndex] = hooks[useReducerIndex] ?? initialState;

      const dispatch = (action) => {
        const newState = reducer(hooks[useReducerIndex], action);
        hooks[useReducerIndex] = newState;
        ReactDOM.update();
      };

      return [hooks[useReducerIndex], dispatch];
    },
    useEffect(callback, depArray) {
      const hasNoDeps = !depArray;
      const deps = hooks[currentIndex];
      const hasChangedDeps = deps
        ? !depArray.every((el, i) => el === deps[i])
        : true;
      if (hasNoDeps || hasChangedDeps) {
        hooks[currentIndex] = depArray;
        callback();
      }
      currentIndex++;
    },
  };
})();

function Link(props) {
  const a = document.createElement("a");
  a.href = props.href;
  a.textContent = props.label;
  a.onclick = function (event) {
    event.preventDefault();
    props.onClick();
  };
  return a;
}

function AboutPage(props) {
  const linkHome = Link({
    href: "#home",
    label: "Back to Home",
    onClick: props.onLinkHomeClick,
  });

  const p = document.createElement("p");
  p.textContent = "Welcome to About Page";

  const div = document.createElement("div");
  div.appendChild(linkHome);
  div.appendChild(p);
  return div;
}

function Navbar(props) {
  const linkHome = Link({
    href: "#home",
    label: "Home",
    onClick: props.onLinkHomeClick,
  });
  const linkAbout = Link({
    href: "#about",
    label: "About",
    onClick: props.onLinkAboutClick,
  });

  const div = document.createElement("div");
  div.append(linkHome);
  div.append(linkAbout);

  return div;
}

function ProductSearchInput(props) {
  const input = document.createElement("input");
  input.id = "input";
  input.value = props.inputValue;
  input.placeholder = "enter your name";
  input.disabled = props.tag === "loading";
  input.oninput = function (event) {
    props.onInputChange(event.target.value);
  };

  const buttonClear = document.createElement("button");
  buttonClear.textContent = "Clear";
  buttonClear.disabled = props.tag === "loading";
  buttonClear.onclick = function () {
    props.onButtonClearClick();
  };

  const buttonSubmit = document.createElement("button");
  buttonSubmit.textContent = "Submit";
  buttonSubmit.disabled = props.tag === "loading";
  buttonSubmit.onclick = function () {
    props.onButtonSubmitClick();
  };

  const div = document.createElement("div");
  div.append(input);
  div.append(buttonClear);
  div.append(buttonSubmit);

  return div;
}

function ProductItem(props) {
  const titleText = document.createElement("p");
  titleText.textContent = props.title;
  return titleText;
}

function ProductList(props) {
  const items = props.products.map((product) =>
    ProductItem({ title: product.title })
  );

  const loadingText = document.createElement("p");
  loadingText.textContent = "Loading Products...";

  const emptyText = document.createElement("p");
  emptyText.textContent = "Product Empty";

  const errorText = document.createElement("p");
  errorText.textContent = props.errorMessage;

  const div = document.createElement("div");

  if (props.tag === "loading") {
    div.append(loadingText);
  } else if (props.tag === "error") {
    div.append(errorText);
  } else if (props.tag === "empty") {
    div.append(emptyText);
  } else if (props.tag === "loaded") {
    div.append(...items);
  }

  return div;
}

function reducer(prevState, action) {
  switch (prevState.tag) {
    case "idle": {
      switch (action.type) {
        case "FETCH": {
          return { ...prevState, tag: "loading" };
        }
        default: {
          return prevState;
        }
      }
    }
    case "loading": {
      switch (action.type) {
        case "FETCH_SUCCESS": {
          return {
            ...prevState,
            tag: "loaded",
            errorMessage: "",
            products: action.payload.products,
          };
        }
        case "FETCH_EMPTY": {
          return {
            ...prevState,
            tag: "empty",
            errorMessage: "",
            products: [],
          };
        }
        case "FETCH_ERROR": {
          return {
            ...prevState,
            tag: "error",
            errorMessage: action.payload.errorMessage,
            products: [],
          };
        }
        default: {
          return prevState;
        }
      }
    }
    case "loaded": {
      switch (action.type) {
        case "CHANGE_INPUT": {
          return {
            ...prevState,
            inputValue: action.payload.inputValue,
          };
        }
        case "CLEAR_INPUT": {
          return {
            ...prevState,
            inputValue: "",
          };
        }
        case "FETCH": {
          return { ...prevState, tag: "loading" };
        }
        default: {
          return prevState;
        }
      }
    }
    case "empty": {
      switch (action.type) {
        case "CHANGE_INPUT": {
          return {
            ...prevState,
            inputValue: action.payload.inputValue,
          };
        }
        case "CLEAR_INPUT": {
          return {
            ...prevState,
            inputValue: "",
          };
        }
        case "FETCH": {
          return { ...prevState, tag: "loading" };
        }
        default: {
          return prevState;
        }
      }
    }
    case "error": {
      switch (action.type) {
        case "CHANGE_INPUT": {
          return {
            ...prevState,
            inputValue: action.payload.inputValue,
          };
        }
        case "CLEAR_INPUT": {
          return {
            ...prevState,
            inputValue: "",
          };
        }
        case "FETCH": {
          return { ...prevState, tag: "loading" };
        }
        default: {
          return prevState;
        }
      }
    }
    default: {
      return prevState;
    }
  }
}

function HomePage(props) {
  const [state, send] = React.useReducer(reducer, {
    inputValue: localStorage.getItem("inputValue") ?? "",
    tag: "idle",
    products: [],
    errorMessage: "",
  });

  React.useEffect(() => {
    localStorage.setItem("inputValue", state.inputValue);
  }, [state.inputValue]);

  React.useEffect(() => {
    switch (state.tag) {
      case "idle": {
        send({ type: "FETCH" });
        break;
      }
      case "loading": {
        fetch("https://dummyjson.com/products/search?q=" + state.inputValue)
          .then((res) => res.json())
          .then((data) => {
            if (data.products.length === 0) {
              send({ type: "FETCH_EMPTY" });
            } else {
              send({
                type: "FETCH_SUCCESS",
                payload: { products: data.products },
              });
            }
          })
          .catch((err) => {
            send({
              type: "FETCH_ERROR",
              payload: { errorMessage: err.message },
            });
          });
        break;
      }
    }
  }, [state.tag, state.inputValue]);

  const navbar = Navbar({
    onLinkHomeClick: props.onLinkHomeClick,
    onLinkAboutClick: props.onLinkAboutClick,
  });

  const productSearchInput = ProductSearchInput({
    inputValue: state.inputValue,
    tag: state.tag,
    onInputChange: (newInputValue) =>
      send({
        type: "CHANGE_INPUT",
        payload: { inputValue: event.target.value },
      }),
    onButtonClearClick: () => send({ type: "CLEAR_INPUT" }),
    onButtonSubmitClick: () => send({ type: "FETCH" }),
  });

  const productList = ProductList({
    products: state.products,
    tag: state.tag,
    errorMessage: state.errorMessage,
  });

  const p = document.createElement("p");
  p.textContent = "Welcome to Home Page";

  const textPreview = document.createElement("p");
  textPreview.textContent = state.inputValue;

  const div = document.createElement("div");
  div.append(navbar);
  div.append(p);
  div.append(productSearchInput);
  div.append(textPreview);
  div.append(productList);

  return div;
}

function App() {
  const [hash, setHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    history.pushState(null, "", hash);
  }, [hash]);

  const onLinkHomeClick = () => {
    setHash("#home");
  };

  const onLinkAboutClick = () => {
    setHash("#about");
  };

  const homePage = HomePage({ onLinkHomeClick, onLinkAboutClick });
  const aboutPage = AboutPage({ onLinkHomeClick });

  if (hash == "#home") {
    return homePage;
  } else if (hash == "#about") {
    return aboutPage;
  } else {
    return homePage;
  }
}

const root = document.getElementById("root");
ReactDOM.render(root, App);
