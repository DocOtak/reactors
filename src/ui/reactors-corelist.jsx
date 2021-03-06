import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Form,
  ListGroup,
  Button,
  ButtonGroup,
  Dropdown,
  Row,
  Col,
} from "react-bootstrap";

import { coreNameSortCompare } from "../reactor-cores";
import {DownloadButton} from "./output-download"
import { XSAbrev } from '../physics/neutrino-cross-section'

const CoreType = ({ core }) => {
  const coreDef = {
    LEU: "low enriched uranium reactor",
    PWR: "pressurized water reactor",
    BWR: "boiling water reactor",
    LWGR: "light water graphite reactor (RBMK)",
    HWLWR: "heavy water light water reactor",
    PHWR: "pressurized heavy-water reactor",
    GCR: "gas-cooled reactor",
    HEU: "highly enriched uranium reactor",
    FBR: "fast breeder reactor",
  };
  if (core.mox) {
    return (
      <span>
        <span title={coreDef[core.type]}>{core.type}</span> with{" "}
        <span title="Mixed oxide fuel">MOX</span>
      </span>
    );
  }
  return <span title={coreDef[core.type]}>{core.type}</span>;
};

const CoreListItem = ({
  core,
  reactorLF,
  coreMods,
  setCoreMods,
  crossSection,
  detector,
}) => {
  const lf = core.loadFactor(reactorLF.start, reactorLF.end);
  const fullPower = () => {
    const newMods = {...coreMods, [core.name]: {loadOverride: 1}};
    setCoreMods(newMods)
  };
  const iaeaPower = () => {
    const newMods = {...coreMods, [core.name]: {loadOverride: undefined}};
    setCoreMods(newMods)
  };
  const noPower = () => {
    const newMods = {...coreMods, [core.name]: {loadOverride: 0}};
    setCoreMods(newMods)
  };
  let dist = core.detectorDistance.toFixed(0);
  if (core.detectorDistance < 10) {
    dist = core.detectorDistance.toFixed(2);
  } else if (core.detectorDistance < 100) {
    dist = core.detectorDistance.toFixed(1);
  }

  const downloadFilename = `Enu_spec10keV_${core.name}_${detector.current}_${XSAbrev[crossSection]}.csv`.replace(/\s/g, "_").replace(/\(|\)/g, '')
  const downloadData = {
    "bin center (MeV)": core.detectorSignal.map((n,i) => 0.005 + i * 0.01),
    NIU: core.detectorSignal 
  }
  const downloadFormatters = {
    "bin center (MeV)": v => v.toFixed(3),
  }

  return (
    <ListGroup.Item>
      <h6>{core.name}</h6>
      <Row>
        <Col xl="auto">
          <ButtonGroup size="sm">
            <Button onClick={fullPower} variant="secondary">
              Set to 100% Load
            </Button>
            {core.type !== "custom" &&
            <Button onClick={iaeaPower} variant="secondary">
              Use IAEA LF Data
            </Button>}
            <Button onClick={noPower} variant="secondary">
              Turn Core Off
            </Button>
          </ButtonGroup>
        </Col>
        <Col xl>
          <DownloadButton buttonTitle="Downlaod Core Spectrum" data={downloadData} formatters={downloadFormatters} filename={downloadFilename}/>
        </Col>
      </Row>
      <Row>
        <Col xl="auto">
          Type: <CoreType core={core} />
          <br />
          <span title="The Reference thermal power of the plant expressed in MW(th). The reactor thermal power is the net heat transferred from the fuel to the coolant.">
            Thermal Capacity:
          </span>{" "}
          {core.power} MW
          <br />
          Load Factor: {(lf * 100).toFixed(1)}%<br />
          Operating Power: {(lf * core.power).toFixed(0)} MW
          <br />
          Signal: {core.detectorNIU.toFixed(3)} NIU
        </Col>
        <Col xl>
          Lat: {core.lat.toFixed(4)} N<br />
          Lon: {core.lon.toFixed(4)} E<br />
          Elevation: {core.elevation} meters
          <br />
          Distance: {dist} km< br/>
          φ: {core.direction.phi.toFixed(1)} θ: {core.direction.elev.toFixed(1)}
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export const CoreList = ({
  cores,
  reactorLF,
  coreMods,
  setCoreMods,
  addCustomModal,
  manCustomModal,
  detector,
  crossSection,
}) => {
  const [filter, setFilter] = useState("");
  const [displayLength, setDisplayLength] = useState(10);
  const [sortMethod, setSortMethod] = useState("distance");
  const [visible, setVisible] = useState(false);

  const cardRef = useRef(this)

  useEffect(()=>{
    let options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    }

    let observer = new IntersectionObserver((entries, observer) => {setVisible(entries[0].isIntersecting)}, options);
    observer.observe(cardRef.current)
  }, [])

  const coreObjs = Object.values(cores);

  const testCore = (core, filter) => {
    if (filter === "") {
      return true;
    }
    const reg = new RegExp(filter, "i");
    return reg.test(core.name);
  };

  const fullPowerAll = () => {
    const coreMods = Object.fromEntries(Object.entries(cores).map(([name, core]) => [name, {loadOverride: 1}]));
    setCoreMods(coreMods)
  };
  const noPowerAll = () => {
    const coreMods = Object.fromEntries(Object.entries(cores).map(([name, core]) => [name, {loadOverride: 0}]));
    setCoreMods(coreMods)
  };
  const iaeaPowerAll = () => {
    const coreMods = Object.fromEntries(Object.entries(cores).map(([name, core]) => [name, {loadOverride: undefined}]));
    setCoreMods(coreMods)
  };

  const sortFunctions = {
    name: coreNameSortCompare,
    distance: (a, b) => a.detectorDistance - b.detectorDistance,
    signal: (a, b) => b.detectorNIU - a.detectorNIU,
    type: (a, b) => a.type.localeCompare(b.type),
    capacity: (a, b) => b.power - a.power,
  };

  const coresForRender = visible ? coreObjs
  .filter((core) => testCore(core, filter))
  .sort(sortFunctions[sortMethod])
  .slice(0, displayLength) : []

  return (
    <Card ref={cardRef}>
      <Card.Header>
        <Form inline onSubmit={e => { e.preventDefault(); }}>
          <h5 className="mr-auto">Core List</h5>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-custom-roes">
              Custom Cores
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={addCustomModal}>
                Add Custom Core
              </Dropdown.Item>
              <Dropdown.Item onClick={manCustomModal}>
                Delete Custom Cores
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-all-cores">
              Control all Cores
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={fullPowerAll}>
                Use 100% load for all cores
              </Dropdown.Item>
              <Dropdown.Item onClick={iaeaPowerAll}>
                Use IAEA LF data for all cores
              </Dropdown.Item>
              <Dropdown.Item onClick={noPowerAll}>
                Turn off all cores
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Form.Control
            value={filter}
            onChange={({ target: { value } }) => setFilter(value)}
            type="search"
            placeholder="Filter Core List"
            className="mr-sm-2"
          />
        </Form>
      </Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item>
        <Row>
          <Col xs={4}>
          <h6>Core List Display Options</h6>
          <Form.Control
          value={displayLength}
            onChange={(event) => setDisplayLength(parseInt(event.target.value))}
            as="select"
          >
            <option value="10">Show: First 10 Cores</option>
            <option value="1000000">Show: All Cores</option>
          </Form.Control>
          <Form.Control
          value={sortMethod}
            onChange={(event) => setSortMethod(event.target.value)}
            as="select"
          >
            <option value="signal">Sort By: Signal</option>
            <option value="distance">Sort By: Distance</option>
            <option value="capacity">Sort By: Thermal Capacity</option>
            <option value="type">Sort By: Core Type</option>
            <option value="name">Sort By: Name</option>
          </Form.Control>
          </Col>
        </Row>
        </ListGroup.Item>
        {
          coresForRender.map((core) => (
            <CoreListItem
              key={core.name}
              core={core}
              reactorLF={reactorLF}
              coreMods={coreMods}
              setCoreMods={setCoreMods}
              detector={detector}
              crossSection={crossSection}
            />
          ))}
      </ListGroup>
    </Card>
  );
};
