import { describe, expect, test } from "bun:test";
import { TranslationException, trans } from "@/index";

describe("trans", () => {
  describe("String Key with Dictionary", () => {
    test("should return translation for given key and language", () => {
      const dict = {
        greeting: {
          en: "Hello",
          fr: "Bonjour",
          es: "Hola",
        },
      };

      const result = trans("greeting", { lang: "en", dict });
      expect(result).toBe("Hello");
    });

    test("should return French translation when specified", () => {
      const dict = {
        greeting: {
          en: "Hello",
          fr: "Bonjour",
          es: "Hola",
        },
      };

      const result = trans("greeting", { lang: "fr", dict });
      expect(result).toBe("Bonjour");
    });

    test("should fallback to English when requested language not available", () => {
      const dict = {
        greeting: {
          en: "Hello",
          fr: "Bonjour",
        },
      };

      const result = trans("greeting", { lang: "es", dict });
      expect(result).toBe("Hello");
    });

    test("should fallback to key when no translation available", () => {
      const dict = {
        greeting: {
          de: "Hallo",
        },
      };

      const result = trans("greeting", { lang: "es", dict });
      expect(result).toBe("greeting");
    });

    test("should handle nested keys with dot notation", () => {
      const dict = {
        user: {
          profile: {
            name: {
              en: "Name",
              fr: "Nom",
              es: "Nombre",
            },
          },
        },
      };

      const result = trans("user.profile.name", { lang: "fr", dict });
      expect(result).toBe("Nom");
    });

    test("should handle deeply nested keys", () => {
      const dict = {
        app: {
          ui: {
            components: {
              button: {
                submit: {
                  en: "Submit",
                  fr: "Soumettre",
                },
              },
            },
          },
        },
      };

      const result = trans("app.ui.components.button.submit", { lang: "en", dict });
      expect(result).toBe("Submit");
    });

    test("should throw TranslationException when key not found in dictionary", () => {
      const dict = {
        greeting: {
          en: "Hello",
        },
      };

      expect(() => {
        trans("nonexistent", { lang: "en", dict });
      }).toThrow(TranslationException);

      expect(() => {
        trans("nonexistent", { lang: "en", dict });
      }).toThrow('Translation key "nonexistent" not found');
    });

    test("should throw TranslationException when nested key not found", () => {
      const dict = {
        user: {
          profile: {
            name: {
              en: "Name",
            },
          },
        },
      };

      expect(() => {
        trans("user.profile.email", { lang: "en", dict });
      }).toThrow(TranslationException);
    });

    test("should default to English language when not specified", () => {
      const dict = {
        greeting: {
          en: "Hello",
          fr: "Bonjour",
        },
      };

      const result = trans("greeting", { dict });
      expect(result).toBe("Hello");
    });
  });

  describe("Object Key (Direct Translation)", () => {
    test("should return translation from object key for specified language", () => {
      const translations = {
        en: "Hello World",
        fr: "Bonjour le Monde",
        es: "Hola Mundo",
      } as Record<string, string>;

      const result = trans(translations, { lang: "fr" });
      expect(result).toBe("Bonjour le Monde");
    });

    test("should fallback to English when requested language not available in object", () => {
      const translations = {
        en: "Hello World",
        fr: "Bonjour le Monde",
      } as Record<string, string>;

      const result = trans(translations, { lang: "es" });
      expect(result).toBe("Hello World");
    });

    test("should default to English when no language specified", () => {
      const translations = {
        en: "Hello World",
        fr: "Bonjour le Monde",
      } as Record<string, string>;

      const result = trans(translations);
      expect(result).toBe("Hello World");
    });

    test("should throw TranslationException when object has no valid translation", () => {
      const translations = {
        de: "Hallo Welt",
        it: "Ciao Mondo",
      } as Record<string, string>;

      expect(() => {
        trans(translations, { lang: "en" });
      }).toThrow(TranslationException);

      expect(() => {
        trans(translations, { lang: "en" });
      }).toThrow("Translation value is empty");
    });
  });

  describe("Parameter Interpolation", () => {
    test("should replace single parameter in translation", () => {
      const dict = {
        welcome: {
          en: "Welcome {{ name }}!",
          fr: "Bienvenue {{ name }}!",
        },
      };

      const result = trans("welcome", { lang: "en", params: { name: "John" }, dict });
      expect(result).toBe("Welcome John!");
    });

    test("should replace multiple parameters in translation", () => {
      const dict = {
        message: {
          en: "Hello {{ name }}, you have {{ count }} messages",
          fr: "Bonjour {{ name }}, vous avez {{ count }} messages",
        },
      };

      const result = trans("message", { lang: "en", params: { name: "Alice", count: 5 }, dict });
      expect(result).toBe("Hello Alice, you have 5 messages");
    });

    test("should handle different parameter types", () => {
      const dict = {
        stats: {
          en: "Active: {{ active }}, Count: {{ count }}, ID: {{ id }}, Score: {{ score }}",
        },
      };

      const result = trans("stats", {
        lang: "en",
        params: {
          active: true,
          count: 42,
          id: 123n,
          score: "95%",
        },
        dict,
      });

      expect(result).toBe("Active: true, Count: 42, ID: 123, Score: 95%");
    });

    test("should work with object key and parameters", () => {
      const translations = {
        en: "Hello {{ name }}, welcome to {{ app }}!",
        fr: "Bonjour {{ name }}, bienvenue dans {{ app }}!",
      } as Record<string, string>;

      const result = trans(translations, { lang: "fr", params: { name: "Marie", app: "MyApp" } });
      expect(result).toBe("Bonjour Marie, bienvenue dans MyApp!");
    });

    test("should handle parameters with no spaces around braces", () => {
      const dict = {
        compact: {
          en: "User{{id}}has{{count}}items",
        },
      };

      // The function specifically looks for "{{ key }}" format with spaces
      const result = trans("compact", { lang: "en", params: { id: "123", count: "5" }, dict });
      expect(result).toBe("User{{id}}has{{count}}items"); // Should remain unchanged
    });

    test("should leave unreplaced parameters as-is when parameter not provided", () => {
      const dict = {
        partial: {
          en: "Hello {{ name }}, you have {{ count }} items",
        },
      };

      const result = trans("partial", { lang: "en", params: { name: "Bob" }, dict });
      expect(result).toBe("Hello Bob, you have {{ count }} items");
    });

    test("should work without parameters", () => {
      const dict = {
        simple: {
          en: "Simple message",
          fr: "Message simple",
        },
      };

      const result = trans("simple", { lang: "fr", dict });
      expect(result).toBe("Message simple");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should throw TranslationException when string key used without dictionary", () => {
      expect(() => {
        trans("some.key", { lang: "en" });
      }).toThrow(TranslationException);
    });

    test("should handle empty dictionary", () => {
      const dict = {};

      expect(() => {
        trans("any.key", { lang: "en", dict });
      }).toThrow(TranslationException);
    });

    test("should handle null values in dictionary", () => {
      const dict = {
        nullValue: null,
      };

      expect(() => {
        trans("nullValue", { lang: "en", dict });
      }).toThrow(TranslationException);
    });

    test("should handle undefined values in nested path", () => {
      const dict = {
        user: {
          profile: undefined,
        },
      };

      expect(() => {
        trans("user.profile.name", { lang: "en", dict });
      }).toThrow(TranslationException);
    });

    test("should handle empty string translations", () => {
      const dict = {
        empty: {
          en: "",
          fr: "",
        },
      };

      // Empty strings are falsy, so they fallback to the key
      const result = trans("empty", { lang: "en", dict });
      expect(result).toBe("empty");
    });

    test("should handle object key with empty translations", () => {
      const translations = {
        en: "",
        fr: "",
      } as Record<string, string>;

      expect(() => {
        trans(translations, { lang: "en" });
      }).toThrow(TranslationException);
    });

    test("should handle complex nested structure with missing intermediate keys", () => {
      const dict = {
        level1: {
          level2: {
            // level3 is missing
          },
        },
      };

      expect(() => {
        trans("level1.level2.level3.key", { lang: "en", dict });
      }).toThrow(TranslationException);
    });

    test("should handle non-object values in path traversal", () => {
      const dict = {
        user: {
          name: "string_value", // This is a string, not an object
        },
      };

      expect(() => {
        trans("user.name.property", { lang: "en", dict });
      }).toThrow(TranslationException);
    });
  });

  describe("Type Safety and Return Types", () => {
    test("should return string type by default", () => {
      const dict = {
        test: {
          en: "Test message",
        },
      };

      const result = trans("test", { lang: "en", dict });
      expect(typeof result).toBe("string");
    });

    test("should work with explicit generic type", () => {
      const dict = {
        test: {
          en: "Test message",
        },
      };

      const result = trans<string>("test", { lang: "en", dict });
      expect(typeof result).toBe("string");
      expect(result).toBe("Test message");
    });
  });

  describe("Real-world Scenarios", () => {
    test("should handle typical app navigation translations", () => {
      const dict = {
        nav: {
          home: { en: "Home", fr: "Accueil", es: "Inicio" },
          about: { en: "About", fr: "À propos", es: "Acerca de" },
          contact: { en: "Contact", fr: "Contact", es: "Contacto" },
        },
      };

      expect(trans("nav.home", { lang: "fr", dict })).toBe("Accueil");
      expect(trans("nav.about", { lang: "es", dict })).toBe("Acerca de");
      expect(trans("nav.contact", { lang: "en", dict })).toBe("Contact");
    });

    test("should handle form validation messages with parameters", () => {
      const dict = {
        validation: {
          required: {
            en: "{{ field }} is required",
            fr: "{{ field }} est requis",
          },
          minLength: {
            en: "{{ field }} must be at least {{ min }} characters",
            fr: "{{ field }} doit contenir au moins {{ min }} caractères",
          },
        },
      };

      expect(trans("validation.required", { lang: "en", params: { field: "Email" }, dict })).toBe("Email is required");
      expect(trans("validation.minLength", { lang: "fr", params: { field: "Mot de passe", min: 8 }, dict })).toBe(
        "Mot de passe doit contenir au moins 8 caractères",
      );
    });

    test("should handle user dashboard messages", () => {
      const dict = {
        dashboard: {
          welcome: {
            en: "Welcome back, {{ username }}!",
            fr: "Bon retour, {{ username }}!",
          },
          stats: {
            en: "You have {{ unread }} unread messages and {{ tasks }} pending tasks",
            fr: "Vous avez {{ unread }} messages non lus et {{ tasks }} tâches en attente",
          },
        },
      };

      expect(trans("dashboard.welcome", { lang: "en", params: { username: "John" }, dict })).toBe(
        "Welcome back, John!",
      );
      expect(trans("dashboard.stats", { lang: "fr", params: { unread: 3, tasks: 7 }, dict })).toBe(
        "Vous avez 3 messages non lus et 7 tâches en attente",
      );
    });

    test("should handle e-commerce product information", () => {
      const dict = {
        product: {
          price: {
            en: "Price: $29.99",
            fr: "Prix: 29.99€",
          },
          availability: {
            en: "15 items in stock",
            fr: "15 articles en stock",
          },
          shipping: {
            en: "Free shipping for orders over $50",
            fr: "Livraison gratuite pour les commandes de plus de 50€",
          },
        },
      };

      expect(trans("product.price", { lang: "en", dict })).toBe("Price: $29.99");
      expect(trans("product.availability", { lang: "fr", dict })).toBe("15 articles en stock");
      expect(trans("product.shipping", { lang: "en", dict })).toBe("Free shipping for orders over $50");
    });

    test("should handle notification messages", () => {
      const notifications = {
        success: {
          en: "Operation completed successfully!",
          fr: "Opération terminée avec succès!",
        } as Record<string, string>,
        error: {
          en: "An error occurred. Please try again.",
          fr: "Une erreur s'est produite. Veuillez réessayer.",
        } as Record<string, string>,
        info: {
          en: "New updates available",
          fr: "Nouvelles mises à jour disponibles",
        } as Record<string, string>,
      };

      expect(trans(notifications.success, { lang: "fr" })).toBe("Opération terminée avec succès!");
      expect(trans(notifications.error, { lang: "en" })).toBe("An error occurred. Please try again.");
      expect(trans(notifications.info, { lang: "en" })).toBe("New updates available");
    });
  });

  describe("Performance and Memory", () => {
    test("should handle large dictionary structures", () => {
      const largeDict: Record<string, unknown> = {};

      // Create a large nested structure
      for (let i = 0; i < 100; i++) {
        largeDict[`section${i}`] = {
          [`item${i}`]: {
            en: `English text ${i}`,
            fr: `Texte français ${i}`,
          },
        };
      }

      const result = trans("section50.item50", { lang: "fr", dict: largeDict });
      expect(result).toBe("Texte français 50");
    });

    test("should handle deeply nested paths efficiently", () => {
      const deepDict = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: {
                    g: {
                      h: {
                        translation: {
                          en: "Deep translation",
                          fr: "Traduction profonde",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = trans("a.b.c.d.e.f.g.h.translation", { lang: "en", dict: deepDict });
      expect(result).toBe("Deep translation");
    });
  });

  describe("Pluralization", () => {
    describe("Basic Pluralization", () => {
      test("should use singular form for count = 1", () => {
        const dict = {
          item: {
            en: "{{ count }} item",
            fr: "{{ count }} élément",
          },
          item_plural: {
            en: "{{ count }} items",
            fr: "{{ count }} éléments",
          },
        };

        const result = trans("item", { lang: "en", dict, count: 1 });
        expect(result).toBe("1 item");
      });

      test("should use plural form for count > 1", () => {
        const dict = {
          item: {
            en: "{{ count }} item",
            fr: "{{ count }} élément",
          },
          item_plural: {
            en: "{{ count }} items",
            fr: "{{ count }} éléments",
          },
        };

        const result = trans("item", { lang: "en", dict, count: 5 });
        expect(result).toBe("5 items");
      });

      test("should use plural form for count = 0 when no zero form exists", () => {
        const dict = {
          item: {
            en: "{{ count }} item",
            fr: "{{ count }} élément",
          },
          item_plural: {
            en: "{{ count }} items",
            fr: "{{ count }} éléments",
          },
        };

        const result = trans("item", { lang: "en", dict, count: 0 });
        expect(result).toBe("0 items");
      });

      test("should use zero form when available for count = 0", () => {
        const dict = {
          message: {
            en: "{{ count }} message",
            fr: "{{ count }} message",
          },
          message_plural: {
            en: "{{ count }} messages",
            fr: "{{ count }} messages",
          },
          message_zero: {
            en: "no messages",
            fr: "aucun message",
          },
        };

        const result = trans("message", { lang: "en", dict, count: 0 });
        expect(result).toBe("no messages");
      });
    });

    describe("Multi-language Pluralization", () => {
      test("should handle French pluralization", () => {
        const dict = {
          notification: {
            en: "{{ count }} notification",
            fr: "{{ count }} notification",
          },
          notification_plural: {
            en: "{{ count }} notifications",
            fr: "{{ count }} notifications",
          },
          notification_zero: {
            en: "no notifications",
            fr: "aucune notification",
          },
        };

        expect(trans("notification", { lang: "fr", dict, count: 0 })).toBe("aucune notification");
        expect(trans("notification", { lang: "fr", dict, count: 1 })).toBe("1 notification");
        expect(trans("notification", { lang: "fr", dict, count: 3 })).toBe("3 notifications");
      });

      test("should handle Spanish pluralization", () => {
        const dict = {
          libro: {
            en: "{{ count }} book",
            es: "{{ count }} libro",
          },
          libro_plural: {
            en: "{{ count }} books",
            es: "{{ count }} libros",
          },
        };

        expect(trans("libro", { lang: "es", dict, count: 1 })).toBe("1 libro");
        expect(trans("libro", { lang: "es", dict, count: 4 })).toBe("4 libros");
      });
    });

    describe("Nested Key Pluralization", () => {
      test("should handle pluralization with nested keys", () => {
        const dict = {
          user: {
            profile: {
              update: {
                en: "{{ count }} profile update",
                fr: "{{ count }} mise à jour de profil",
              },
              update_plural: {
                en: "{{ count }} profile updates",
                fr: "{{ count }} mises à jour de profil",
              },
              update_zero: {
                en: "no profile updates",
                fr: "aucune mise à jour de profil",
              },
            },
          },
        };

        expect(trans("user.profile.update", { lang: "en", dict, count: 0 })).toBe("no profile updates");
        expect(trans("user.profile.update", { lang: "en", dict, count: 1 })).toBe("1 profile update");
        expect(trans("user.profile.update", { lang: "fr", dict, count: 3 })).toBe("3 mises à jour de profil");
      });
    });

    describe("Parameters with Pluralization", () => {
      test("should combine parameters with pluralization", () => {
        const dict = {
          user_points: {
            en: "{{ username }} has {{ count }} point in {{ category }}",
            fr: "{{ username }} a {{ count }} point dans {{ category }}",
          },
          user_points_plural: {
            en: "{{ username }} has {{ count }} points in {{ category }}",
            fr: "{{ username }} a {{ count }} points dans {{ category }}",
          },
        };

        const result1 = trans("user_points", {
          lang: "en",
          dict,
          count: 1,
          params: { username: "Alice", category: "Gaming" },
        });
        expect(result1).toBe("Alice has 1 point in Gaming");

        const result2 = trans("user_points", {
          lang: "en",
          dict,
          count: 150,
          params: { username: "Bob", category: "Sports" },
        });
        expect(result2).toBe("Bob has 150 points in Sports");
      });

      test("should handle complex parameter combinations", () => {
        const singularText = "{{ customerName }}" + " ordered " + "{{ count }}" + " item for $" + "{{ total }}";
        const pluralText = "{{ customerName }}" + " ordered " + "{{ count }}" + " items for $" + "{{ total }}";
        const dict = {
          order_summary: {
            en: singularText,
          },
          order_summary_plural: {
            en: pluralText,
          },
        };

        const result = trans("order_summary", {
          lang: "en",
          dict,
          count: 3,
          params: { customerName: "John", total: "45.99" },
        });
        expect(result).toBe("John ordered 3 items for $45.99");
      });
    });

    describe("Direct Translation Objects with Pluralization", () => {
      test("should handle count parameter with direct translation objects", () => {
        const directItemText = "{{ count }}" + " direct item";
        const directItemFrText = "{{ count }}" + " élément direct";
        const translations = {
          en: directItemText,
          fr: directItemFrText,
        } as Record<string, string>;

        const result = trans(translations, { lang: "en", count: 5 });
        expect(result).toBe("5 direct item");
      });

      test("should combine parameters and count with direct objects", () => {
        const directMessageText = "{{ user }}" + " has " + "{{ count }}" + " direct message";
        const directMessageFrText = "{{ user }}" + " a " + "{{ count }}" + " message direct";
        const translations = {
          en: directMessageText,
          fr: directMessageFrText,
        } as Record<string, string>;

        const result = trans(translations, {
          lang: "fr",
          count: 2,
          params: { user: "Marie" },
        });
        expect(result).toBe("Marie a 2 message direct");
      });
    });

    describe("Fallback Behavior", () => {
      test("should fallback to singular form when plural forms don't exist", () => {
        const dict = {
          simple: {
            en: "{{ count }} simple thing",
            fr: "{{ count }} chose simple",
          },
        };

        const result = trans("simple", { lang: "en", dict, count: 5 });
        expect(result).toBe("5 simple thing");
      });

      test("should fallback to plural when zero form missing", () => {
        const dict = {
          item: {
            en: "{{ count }} item",
          },
          item_plural: {
            en: "{{ count }} items",
          },
        };

        const result = trans("item", { lang: "en", dict, count: 0 });
        expect(result).toBe("0 items");
      });
    });

    describe("Edge Cases", () => {
      test("should handle negative counts", () => {
        const dict = {
          balance: {
            en: "{{ count }} credit",
          },
          balance_plural: {
            en: "{{ count }} credits",
          },
        };

        const result = trans("balance", { lang: "en", dict, count: -5 });
        expect(result).toBe("-5 credits");
      });

      test("should handle decimal counts", () => {
        const dict = {
          distance: {
            en: "{{ count }} mile",
          },
          distance_plural: {
            en: "{{ count }} miles",
          },
        };

        const result = trans("distance", { lang: "en", dict, count: 2.5 });
        expect(result).toBe("2.5 miles");
      });

      test("should handle zero as exact match", () => {
        const dict = {
          task: {
            en: "{{ count }} task remaining",
          },
          task_plural: {
            en: "{{ count }} tasks remaining",
          },
          task_zero: {
            en: "all tasks completed",
          },
        };

        const result = trans("task", { lang: "en", dict, count: 0 });
        expect(result).toBe("all tasks completed");
      });

      test("should work without count parameter (no pluralization)", () => {
        const dict = {
          greeting: {
            en: "Hello {{ name }}!",
          },
          greeting_plural: {
            en: "Hello {{ name }}s!",
          },
        };

        const result = trans("greeting", { lang: "en", dict, params: { name: "World" } });
        expect(result).toBe("Hello World!");
      });

      test("should throw error when plural key not found and fallback fails", () => {
        const dict = {
          someother: {
            en: "This is a different key",
          },
        };

        expect(() => {
          trans("nonexistent", { lang: "en", dict, count: 5 });
        }).toThrow(TranslationException);
      });
    });

    describe("Real-world Pluralization Scenarios", () => {
      test("should handle shopping cart items", () => {
        const dict = {
          cart: {
            item: {
              en: "{{ count }} item in your cart",
              fr: "{{ count }} article dans votre panier",
            },
            item_plural: {
              en: "{{ count }} items in your cart",
              fr: "{{ count }} articles dans votre panier",
            },
            item_zero: {
              en: "Your cart is empty",
              fr: "Votre panier est vide",
            },
          },
        };

        expect(trans("cart.item", { lang: "en", dict, count: 0 })).toBe("Your cart is empty");
        expect(trans("cart.item", { lang: "en", dict, count: 1 })).toBe("1 item in your cart");
        expect(trans("cart.item", { lang: "fr", dict, count: 3 })).toBe("3 articles dans votre panier");
      });

      test("should handle notification counts", () => {
        const dict = {
          notifications: {
            unread: {
              en: "You have {{ count }} unread notification",
              fr: "Vous avez {{ count }} notification non lue",
            },
            unread_plural: {
              en: "You have {{ count }} unread notifications",
              fr: "Vous avez {{ count }} notifications non lues",
            },
            unread_zero: {
              en: "You have no unread notifications",
              fr: "Vous n'avez aucune notification non lue",
            },
          },
        };

        expect(trans("notifications.unread", { lang: "en", dict, count: 0 })).toBe("You have no unread notifications");
        expect(trans("notifications.unread", { lang: "en", dict, count: 1 })).toBe("You have 1 unread notification");
        expect(trans("notifications.unread", { lang: "fr", dict, count: 5 })).toBe(
          "Vous avez 5 notifications non lues",
        );
      });

      test("should handle time-based pluralization", () => {
        const dict = {
          time: {
            minute: {
              en: "{{ count }} minute ago",
              fr: "il y a {{ count }} minute",
            },
            minute_plural: {
              en: "{{ count }} minutes ago",
              fr: "il y a {{ count }} minutes",
            },
            hour: {
              en: "{{ count }} hour ago",
              fr: "il y a {{ count }} heure",
            },
            hour_plural: {
              en: "{{ count }} hours ago",
              fr: "il y a {{ count }} heures",
            },
          },
        };

        expect(trans("time.minute", { lang: "en", dict, count: 1 })).toBe("1 minute ago");
        expect(trans("time.minute", { lang: "en", dict, count: 30 })).toBe("30 minutes ago");
        expect(trans("time.hour", { lang: "fr", dict, count: 2 })).toBe("il y a 2 heures");
      });

      test("should handle file upload scenarios", () => {
        const dict = {
          upload: {
            file: {
              en: "{{ count }} file uploaded successfully",
              fr: "{{ count }} fichier téléchargé avec succès",
            },
            file_plural: {
              en: "{{ count }} files uploaded successfully",
              fr: "{{ count }} fichiers téléchargés avec succès",
            },
            file_zero: {
              en: "No files uploaded",
              fr: "Aucun fichier téléchargé",
            },
          },
        };

        expect(trans("upload.file", { lang: "en", dict, count: 0 })).toBe("No files uploaded");
        expect(trans("upload.file", { lang: "en", dict, count: 1 })).toBe("1 file uploaded successfully");
        expect(trans("upload.file", { lang: "fr", dict, count: 7 })).toBe("7 fichiers téléchargés avec succès");
      });
    });
  });
});
