import React, { useState } from "react";
import cidades from "../data/cidades";
import "../styles/CityAutocomplete.css";

export default function CityAutocomplete({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);

  const handleInput = (e) => {
    const query = e.target.value;
    onChange({ target: { name: "cidade", value: query } });

    if (query.length > 0) {
      const filtered = cidades
        .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8); // mostra até 8 sugestões
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (cidade) => {
    onChange({ target: { name: "cidade", value: cidade } });
    setSuggestions([]);
  };

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        name="cidade"
        placeholder="Digite a cidade..."
        value={value}
        onChange={handleInput}
        autoComplete="off"
        required
      />
      {suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((c) => (
            <li key={c} onClick={() => handleSelect(c)}>
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
