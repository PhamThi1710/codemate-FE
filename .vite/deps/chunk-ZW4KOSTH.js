import {
  makeSizeProps,
  useSize
} from "./chunk-4A2ER5D2.js";
import {
  IconValue,
  useIcon
} from "./chunk-TJAOABCO.js";
import {
  makeTagProps
} from "./chunk-UAWZA7KV.js";
import {
  makeThemeProps,
  provideTheme
} from "./chunk-DNZVU6LE.js";
import {
  useTextColor
} from "./chunk-5SNBRTN6.js";
import {
  convertToUnit,
  flattenFragments,
  genericComponent,
  makeComponentProps,
  propsFactory,
  useRender
} from "./chunk-6PPR34VZ.js";
import {
  Text,
  computed,
  createVNode,
  ref,
  toRef
} from "./chunk-IJV5NOMV.js";

// node_modules/vuetify/lib/components/VIcon/VIcon.mjs
import "/home/thi/projects/codemate/frontend/node_modules/vuetify/lib/components/VIcon/VIcon.css";
var makeVIconProps = propsFactory({
  color: String,
  disabled: Boolean,
  start: Boolean,
  end: Boolean,
  icon: IconValue,
  ...makeComponentProps(),
  ...makeSizeProps(),
  ...makeTagProps({
    tag: "i"
  }),
  ...makeThemeProps()
}, "VIcon");
var VIcon = genericComponent()({
  name: "VIcon",
  props: makeVIconProps(),
  setup(props, _ref) {
    let {
      attrs,
      slots
    } = _ref;
    const slotIcon = ref();
    const {
      themeClasses
    } = provideTheme(props);
    const {
      iconData
    } = useIcon(computed(() => slotIcon.value || props.icon));
    const {
      sizeClasses
    } = useSize(props);
    const {
      textColorClasses,
      textColorStyles
    } = useTextColor(toRef(props, "color"));
    useRender(() => {
      var _a, _b;
      const slotValue = (_a = slots.default) == null ? void 0 : _a.call(slots);
      if (slotValue) {
        slotIcon.value = (_b = flattenFragments(slotValue).filter((node) => node.type === Text && node.children && typeof node.children === "string")[0]) == null ? void 0 : _b.children;
      }
      const hasClick = !!(attrs.onClick || attrs.onClickOnce);
      return createVNode(iconData.value.component, {
        "tag": props.tag,
        "icon": iconData.value.icon,
        "class": ["v-icon", "notranslate", themeClasses.value, sizeClasses.value, textColorClasses.value, {
          "v-icon--clickable": hasClick,
          "v-icon--disabled": props.disabled,
          "v-icon--start": props.start,
          "v-icon--end": props.end
        }, props.class],
        "style": [!sizeClasses.value ? {
          fontSize: convertToUnit(props.size),
          height: convertToUnit(props.size),
          width: convertToUnit(props.size)
        } : void 0, textColorStyles.value, props.style],
        "role": hasClick ? "button" : void 0,
        "aria-hidden": !hasClick,
        "tabindex": hasClick ? props.disabled ? -1 : 0 : void 0
      }, {
        default: () => [slotValue]
      });
    });
    return {};
  }
});

export {
  VIcon
};
//# sourceMappingURL=chunk-ZW4KOSTH.js.map
