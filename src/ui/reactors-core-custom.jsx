import React, { useState, useEffect } from "react";

import {
  Modal,
  Button,
  Table,
  Form,
  Col,
  Row,
  InputGroup,
} from "react-bootstrap";
import { ReactorCore } from "../reactor-cores";

export const AddCustomCoreModal = ({
  lat,
  lon,
  show,
  customCores,
  setCustomCores,
  close,
}) => {


  let defaultName
  let c = 1;
  do {
    defaultName = defaultName = `Custom Core ${c}`
    c +=1
  } while (defaultName in customCores)

  const [name, setName] = useState(defaultName)

  const [power, setPower] = useState(1000);
  const [elevation, setElevation] = useState(0);

  const [coreLat, setCoreLat] = useState(lat);
  const [coreLon, setCoreLon] = useState(lon);

  useEffect(() => setCoreLat(lat === undefined ? 0 : lat), [lat]);
  useEffect(() => setCoreLon(lon === undefined ? 0 : lon), [lon]);
  useEffect(() => setName(defaultName), [defaultName]);

  const isValid = [power, elevation, coreLat, coreLon].every((value) => !(isNaN(parseFloat(value))))

  const save = () => {
    const newCore = ReactorCore({
      name: name,
      lat: parseFloat(coreLat),
      lon: parseFloat(coreLon),
      power: parseFloat(power),
      elevation: parseFloat(elevation),
      custom: true,
      fisionFractions: {
        U235: 1,
        U238: 0,
        PU239: 0,
        PU241: 0,
      },
    });
    setCustomCores({ ...customCores, [newCore.name]: newCore });
    setName(defaultName)
    close();
  };
  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Add Custom Core</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} controlId="customCoreName">
            <Form.Label column sm="3">
              Core Name
            </Form.Label>
            <Col sm="9">
              <Form.Control onChange={(e) => setName(e.target.value)} defaultValue={name} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="customCoreLat">
            <Form.Label column sm="3">
              Latitude
            </Form.Label>
            <Col sm="9">
              <InputGroup>
                <Form.Control isInvalid={isNaN(parseFloat(coreLat))} onChange={(e) => setCoreLat(e.target.value)} type="number" value={coreLat} />
                <InputGroup.Append>
                  <InputGroup.Text>deg N</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                  Must be a number
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="customCoreLon">
            <Form.Label column sm="3">
              Longitude
            </Form.Label>
            <Col sm="9">
              <InputGroup>
                <Form.Control isInvalid={isNaN(parseFloat(coreLon))} onChange={(e) => setCoreLon(e.target.value)} type="number" value={coreLon} />
                <InputGroup.Append>
                  <InputGroup.Text>deg E</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                  Must be a number
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="customCoreElevation">
            <Form.Label column sm="3">
              Elevation
            </Form.Label>
            <Col sm="9">
              <InputGroup>
                <Form.Control isInvalid={isNaN(parseFloat(elevation))} onChange={(e) => setElevation(e.target.value)} type="number" value={elevation} />
                <InputGroup.Append>
                  <InputGroup.Text>meters</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                  Must be a number
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="customCorePower">
            <Form.Label column sm="3">
              Core Power
            </Form.Label>
            <Col sm="9">
              <InputGroup>
                <Form.Control isInvalid={isNaN(parseFloat(power))} type="number" onChange={(e) => setPower(e.target.value)} value={power} />
                <InputGroup.Append>
                  <InputGroup.Text>MW</InputGroup.Text>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                  Must be a number
                </Form.Control.Feedback>
              </InputGroup>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
        <Button disabled={!isValid} variant="primary" onClick={save}>
          Add Core
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ManageCustomCoreItem = ({ core, delCore }) => {
  return (
    <tr>
      <td>
        <Button variant="danger" onClick={delCore}>
          Delete Core
        </Button>
      </td>
      <td>{core.name}</td>
      <td>{core.lat.toFixed(4)}</td>
      <td>{core.lon.toFixed(4)}</td>
      <td>{core.elevation}</td>
      <td>{core.power}</td>
    </tr>
  );
};

export const ManageCustomCoreModal = ({
  show,
  customCores,
  setCustomCores,
  close,
}) => {
  const coreNmaes = Object.keys(customCores);

  const CoreList = coreNmaes.map((core) => (
    <ManageCustomCoreItem key={core}
      core={customCores[core]}
      delCore={() => {
        let nc = { ...customCores };
        delete nc[core];
        setCustomCores(nc);
      }}
    />
  ));
  return (
    <Modal size="lg" show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Manage Custom Cores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table responsive>
  <thead>
    <tr>
      <th></th>
      <th>Name</th>
      <th>Lat</th>
      <th>Lon</th>
      <th>Elevation</th>
      <th>Power</th>
    </tr>
  </thead>
  <tbody>
      {coreNmaes.length > 0 && CoreList}
  </tbody>
</Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
