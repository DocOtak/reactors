import React, { useState } from "react";

import { Card, Form, InputGroup } from "react-bootstrap";

export const CrustFlux = ({ includeCrust, setIncludeCrust }) => {
  return (
    <Card>
      <Card.Header>Crust Flux</Card.Header>
      <Card.Body>
        <Form.Check
          checked={includeCrust}
          id="crustSignalSlider"
          type="switch"
          label="Include Crust Signal"
          onChange={(event) => setIncludeCrust(event.target.checked)}
        />
        <small>
          We use a pre-computed model of the crust flux provided by W.F.
          McDonough and described in Y. Huang et al., "A reference Earth model
          for the heat producing elements and associated geoneutrino flux,"
          Geochem., Geophys., Geosyst. 14, 2003 (2013).
        </small>
      </Card.Body>
    </Card>
  );
};

export const MantleFlux = ({ geoFluxRatios, setGeoFluxRatios }) => {
  const [U238flux, setU238flux] = useState(geoFluxRatios.U238flux);
  const [ThURatio, setThURatio] = useState(geoFluxRatios.ThURatio);
  const [KURatio, setKURatio] = useState(geoFluxRatios.KURatio);

  const handleChange = (event) => {
    const id = event.target.id;
    const value = event.target.value;
    const setters = {
      U238flux: setU238flux,
      ThURatio: setThURatio,
      KURatio: setKURatio,
    };
    setters[id](value);

    try {
      setGeoFluxRatios({
          ...geoFluxRatios,
          [id]: parseFloat(value),
      });
    } catch {
      // Do Nothing
    }
  };

  return (
    <Card>
      <Card.Header>Mantle Flux Inputs</Card.Header>
      <Card.Body>
        <Form.Group controlId="U238flux">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>
                <sup>238</sup>U Mantle Flux
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              value={U238flux}
              type="number"
              placeholder="0"
              step="100000"
              onChange={handleChange}
            />
            <InputGroup.Append>
              <InputGroup.Text>
                cm<sup>-2</sup>s<sup>-1</sup>
              </InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
        <Form.Group controlId="ThURatio">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Th/U Ratio</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              value={ThURatio}
              type="number"
              placeholder="0"
              step="0.1"
              onChange={handleChange}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group controlId="KURatio">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>K/U Ratio</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              value={KURatio}
              type="number"
              placeholder="0"
              step="1000"
              onChange={handleChange}
            />
          </InputGroup>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};
